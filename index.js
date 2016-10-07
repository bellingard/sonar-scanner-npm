var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var os = require('os');
var format = require('util').format;
var extend = require('extend');
var readPackage = require('read-pkg');
var slug = require('slug');
var log = require('fancy-log');
var logError = log.error;

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
      // Increase the amount of data allowed on stdout or stderr
      // (if this value is exceeded then the child process is killed).
      // TODO: make this customizable
      maxBuffer : 1024*1024
  }

  return options_exec;
}

/*
 * Main function that actually triggers the analysis.
 */
function scan(params) {
  log("Starting SonarQube analysis...");

  //var SONAR_SCANNER_COMMAND = "sonar-scanner";
  var SONAR_SCANNER_COMMAND = "/Users/bellingard/Tests/_TEMP_/bdd-scanner-natif/app/bin/org.sonarsource.scanner.standalone"

  var options_exec = prepareExecEnvironment(params);

  var scanner = exec(SONAR_SCANNER_COMMAND, options_exec, function () {});
  scanner.stdout.on('data', function (c) {
      log(c);
  });
  scanner.stderr.on('data', function (c) {
      logError(c);
  });
  scanner.on('exit', function (code) {
      if (code !== 0) {
          logError(format('Return code: %d.', code));
          // TODO: maybe we should throw an error so that upstream code can
          // know that something went wrong
      }
      log(format('Return code: %d.', code));
  });

};

module.exports = scan;
//module.exports = defineSonarQubeScannerParams;
