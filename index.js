var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;
var os = require('os');
var format = require('util').format;
var extend = require('extend');
var readPackage = require('read-pkg');
var slug = require('slug');
var log = require('fancy-log');
var logError = log.error;

// local dependencies
var sonarQubeParams = require('./deps/sonarqube-scanner-params');


module.exports = scan;

/*
 * Main function that actually triggers the analysis.
 */
function scan(params) {
  log("Starting SonarQube analysis...");

  var sqScannerCommand = findExecutable();
  var options_exec = prepareExecEnvironment(params);

  exec(sqScannerCommand, options_exec);
};

/*
 * Add everything required into the environment variables for the SQ Scanner
 * to get executed successfully.
 */
function prepareExecEnvironment(params) {
  var mergedEnv = {};

  // We need to merge the existing env variables (process.env) with the new ones
  extend(mergedEnv, process.env, {
    SONARQUBE_SCANNER_PARAMS : JSON.stringify(sonarQubeParams(params))
  });

  // this is the actual object that the process.exec function is waiting for
  var options_exec = {
      env : mergedEnv,
      stdio : [0,1,2],
      // Increase the amount of data allowed on stdout or stderr
      // (if this value is exceeded then the child process is killed).
      // TODO: make this customizable
      maxBuffer : 1024*1024
  }

  return options_exec;
}


/*
 * Returns the SQ Scanner executable:
 * - the one available in the PATH if it exists (meaning user has also JAVA)
 * - or the standalone JDK-9 binaries (that don't require JAVA on the box)
 */
function findExecutable() {
  var command = "sonar-scanner";
  if (isWindows()) {
    command += ".bat";
  }

  try {
    exec(command + " -v", {});
  } catch (e) {
    // sonar-scanner is not in the PATH => download the binaries for the
    // correct platform... but this is not supported for the moment.
    throw Error("SonarQube Scanner not found and impossible to download a compatible binary for it (yet!).");
  }

  return command;
}


/*
 * Some util functions...
 */
function isWindows() {
  return /^win/.test(process.platform);
}

function isMac() {
  return /^darwin/.test(process.platform);
}
