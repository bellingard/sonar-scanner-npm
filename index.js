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
 * Try to be smart and guess most SQ parameters from JS files that
 * might exist - like "package.json".
 */
function defineSonarQubeScannerParams(params) {
  var projectBaseDir = process.cwd();

  // set default values if nothing is found later
  var serverUrl = "http://localhost:9000";
  var token = "";
  var projectKey = slug(path.basename(projectBaseDir));
  var projectName = projectKey;
  var projectVersion = "1.0";
  var projectDescription = "No description.";
  var projectHomePage = "";

  // Check what's passed in the call params
  if (params.serverUrl) {
    serverUrl = params.serverUrl;
  }
  if (params.token) {
    token = params.token;
  }

  // now try to read "package.json" file
  try {
      var packageFile = path.join(projectBaseDir, "package.json");
      fs.accessSync(packageFile, fs.F_OK);
      var pkg = readPackage.sync(packageFile);
      if (pkg) {
        projectKey = slug(pkg.name);
        projectName = pkg.name;
        projectVersion = pkg.version;
        if (pkg.description) {
          projectDescription = pkg.description;
        }
        if (pkg.homepage) {
          projectHomePage = pkg.homepage;
        }
      }
  } catch (e) {
      // No "package.json" file - let's remain on the defaults
      log('No "package.json" file found. Using default settings.');
  }

  var sonarqubeScannerParams = {
    "sonar.host.url" : serverUrl,
    "sonar.login" : token,
    "sonar.projectKey" : projectKey,
    "sonar.projectName" : projectName,
    "sonar.projectVersion" : projectVersion,
    "sonar.projectDescription" : projectDescription,
    "sonar.links.homepage" : projectHomePage,
    "sonar.sources" : ".",
    "sonar.exclusions" : "node_modules/**"
  };

  return sonarqubeScannerParams;
}


/*
 * Add everything required into the environment variables for the SQ Scanner
 * to get executed successfully.
 */
function prepareExecEnvironment(params) {
  var mergedEnv = {};

  // We need to merge the existing env variables (process.env) with the new ones
  extend(mergedEnv, process.env, {
    SONARQUBE_SCANNER_PARAMS : JSON.stringify(defineSonarQubeScannerParams(params))
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
    // correct platform
    // => currently it's here...
    command = "/Users/bellingard/Tests/_TEMP_/bdd-scanner-natif/app/bin/org.sonarsource.scanner.standalone";
    if (isWindows()) {
      command += ".bat";
    }
  }

  return command;
}


/*
 * Some util functions...
 */
function isWindows() {
  return /^win/.test(process.platform);
}
