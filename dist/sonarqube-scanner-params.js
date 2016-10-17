var fs = require('fs');
var path = require('path');
var extend = require('extend');
var readPackage = require('read-pkg');
var slug = require('slug');

module.exports = defineSonarQubeScannerParams;

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
