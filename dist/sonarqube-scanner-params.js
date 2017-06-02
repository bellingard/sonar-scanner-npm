var fs = require('fs');
var path = require('path');
var extend = require('extend');
var readPackage = require('read-pkg').sync;
var slug = require('slug');
var log = require('fancy-log');

module.exports = defineSonarQubeScannerParams;

/*
 * Try to be smart and guess most SQ parameters from JS files that
 * might exist - like "package.json".
 */
function defineSonarQubeScannerParams(params, projectBaseDir, sqScannerParamsFromEnvVariable) {
    // #1 - set default values
    var sonarqubeScannerParams = {
        "sonar.host.url": "http://localhost:9000",
        "sonar.login": "",
        "sonar.projectKey": slug(path.basename(projectBaseDir)),
        "sonar.projectName": path.basename(projectBaseDir),
        "sonar.projectVersion": "0.0.1",
        "sonar.projectDescription": "No description.",
        "sonar.sources": ".",
        "sonar.exclusions": "node_modules/**"
    };

    // #1 - try to read "package.json" file
    try {
        var packageFile = path.join(projectBaseDir, "package.json");
        fs.accessSync(packageFile, fs.F_OK);
        // there's a 'package.json' file - let's grab some info
        extractInfoFromPackageFile(sonarqubeScannerParams, packageFile);
    } catch (e) {
        // No "package.json" file (or invalid one) - let's remain on the defaults
        log(`No "package.json" file found (or no valid one): ${e.message}`);
        log('=> Using default settings.');
    }

    // #2 - if SONARQUBE_SCANNER_PARAMS exists, extend the current params
    if (sqScannerParamsFromEnvVariable) {
        extend(sonarqubeScannerParams, sqScannerParamsFromEnvVariable);
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

function extractInfoFromPackageFile(sonarqubeScannerParams, packageFile) {
    log('Getting info from "package.json" file');
    var pkg = readPackage(packageFile);
    if (pkg) {
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
}
