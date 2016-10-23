var fs = require('fs');
var path = require('path');
var extend = require('extend');
var readPackage = require('read-pkg');
var slug = require('slug');
var log = require('fancy-log');

module.exports = defineSonarQubeScannerParams;

/*
 * Try to be smart and guess most SQ parameters from JS files that
 * might exist - like "package.json".
 */
function defineSonarQubeScannerParams(params) {
    var projectBaseDir = process.cwd();

    // #1 - set default values
    var sonarqubeScannerParams = {
        "sonar.host.url": "http://localhost:9000",
        "sonar.login": "",
        "sonar.projectKey": slug(path.basename(projectBaseDir)),
        "sonar.projectName": path.basename(projectBaseDir),
        "sonar.projectVersion": "1.0",
        "sonar.projectDescription": "No description.",
        "sonar.sources": ".",
        "sonar.exclusions": "node_modules/**"
    };

    // #1 - try to read "package.json" file
    try {
        var packageFile = path.join(projectBaseDir, "package.json");
        fs.accessSync(packageFile, fs.F_OK);
        var pkg = readPackage.sync(packageFile);
        if (pkg) {
            // there's a 'package.json' file - let's grab some info
            sonarqubeScannerParams["sonar.projectKey"] = slug(pkg.name);
            sonarqubeScannerParams["sonar.projectName"] = pkg.name;
            sonarqubeScannerParams["sonar.projectVersion"] = pkg.version;
            if (pkg.description) {
                sonarqubeScannerParams["sonar.projectDescription"] = pkg.description;
            }
            if (pkg.homepage) {
                sonarqubeScannerParams["sonar.links.homepage"] = pkg.homepage;
            }
            if (pkg.bugs && pkg.bugs.url) {
                sonarqubeScannerParams["sonar.links.issues"] = pkg.bugs.url;
            }
            if (pkg.repository && pkg.repository.url) {
                sonarqubeScannerParams["sonar.links.scm"] = pkg.repository.url;
            }
        }
    } catch (e) {
        // No "package.json" file - let's remain on the defaults
        log('No "package.json" file found. Using default settings.');
    }

    // #2 - read SONARQUBE_SCANNER_PARAMS if it exists, and if yes extend the current params
    var envParams = process.env.SONARQUBE_SCANNER_PARAMS;
    if (envParams) {
        extend(sonarqubeScannerParams, JSON.parse(envParams));
    }

    // #3 - check what's passed in the call params - these are prevalent params
    if (params.serverUrl) {
        sonarqubeScannerParams["sonar.host.url"] = params.serverUrl;
    }
    if (params.token) {
        sonarqubeScannerParams["sonar.login"] = params.token;
    }
    if (params.options) {
        extend(sonarqubeScannerParams, params.options);
    }

    return sonarqubeScannerParams;
}
