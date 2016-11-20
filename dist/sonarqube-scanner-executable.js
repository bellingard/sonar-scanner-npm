var fs = require('fs');
var path = require('path');
var exec = require('child_process').execSync;
var mkdirs = require('mkdirp').sync;
var extend = require('extend');
var Download = require('download');
var downloadStatus = require('download-status');
var log = require('fancy-log');
var logError = log.error;
var sonarQubeParams = require('./sonarqube-scanner-params');

module.exports.defineSonarQubeScannerExecutable = defineSonarQubeScannerExecutable;
module.exports.prepareExecEnvironment = prepareExecEnvironment;

/*
 * Prepare the executable options (including env environments) required to run the
 * SQ executable.
 */
function prepareExecEnvironment(params, process) {
    // Define what the SQ Scanner params must be
    var processEnvParams = {};
    if (process.env.SONARQUBE_SCANNER_PARAMS) {
        processEnvParams = JSON.parse(process.env.SONARQUBE_SCANNER_PARAMS);
    }
    var sqScannerParams = sonarQubeParams(
        params,
        process.cwd(),
        processEnvParams
    );

    // We need to merge the existing env variables (process.env) with the SQ ones
    var mergedEnv = {};
    extend(mergedEnv, process.env, {
        SONARQUBE_SCANNER_PARAMS: JSON.stringify(sqScannerParams)
    });

    // this is the actual object that the process.exec function is waiting for
    var options_exec = {
        env: mergedEnv,
        stdio: [0, 1, 2],
        // Increase the amount of data allowed on stdout or stderr
        // (if this value is exceeded then the child process is killed).
        // TODO: make this customizable
        maxBuffer: 1024 * 1024
    };

    return options_exec;
}

/*
 * Returns the SQ Scanner executable:
 * - the one available in the PATH if it exists (meaning user has also JAVA)
 * - or the standalone JDK-9 binaries (that don't require JAVA on the box)
 */
function defineSonarQubeScannerExecutable(passExecutableCallback) {
    var command = "sonar-scanner";
    if (isWindows()) {
        command += ".bat";
    }

    // #1 - Try to execute the "sonar-scanner" command
    var executableFound = false;
    try {
        exec(command + " -v", {});
        // if we're here, this means that the SQ Scanner can be executed
        log("Local install of SonarQube scanner found. Using it.");
        // TODO: we should check that it's at least v2.8+
        executableFound = true;
    } catch (e) {
        // sonar-scanner is not in the PATH => we'll download the binaries for the
        // correct platform...
        log("Local install of SonarQube scanner not found.");
    }
    if (executableFound) {
        passExecutableCallback(command);
        return;
    }

    // #2 - Download the binaries from https://github.com/henryju/bdd-scanner-natif
    log("Trying to use the target binaries for the '" + process.platform + "' platform...");
    if (isWindows() || isLinux() || isMac()) {
        getPlatformBinaries(passExecutableCallback);
        return;
    }

    // #3 - If we're here, nothing can be done...
    throw Error("SonarQube Scanner not found and impossible to download a compatible binary for it.");
}

function getPlatformBinaries(passExecutableCallback) {
    var platformBinariesVersion = "0.1";
    var installFolder = path.join(process.env.HOME, ".sonar", "native-sonar-scanner", platformBinariesVersion);
    var binaryExtension = "";
    if (isWindows()) {
        binaryExtension = ".bat";
    }

    // #1 - Try to execute the "<installFolder>/bin/org.sonarsource.scanner.standalone" command
    var executableFound = false;
    try {
        var platformExecutable = path.join(installFolder, "bin", "org.sonarsource.scanner.standalone" + binaryExtension);
        log("Checking if executable exists: " + platformExecutable);
        fs.accessSync(platformExecutable, fs.F_OK);
        // executable exists!
        log("Platform binaries for SonarQube scanner found. Using it.");
        executableFound = true;
    } catch (e) {
        log("Could not find executable in '" + installFolder + "'.");
    }
    if (executableFound) {
        passExecutableCallback(platformExecutable);
        return;
    }

    // #2 - Download the binaries and unzip them
    log("Proceed with download of the platform binaries for SonarQube Scanner...");
    log("Creating " + installFolder);
    mkdirs(installFolder);
    var targetOS = findTargetOS();
    var fileName = "sonarqube-scanner-"
        + targetOS
        + "-x86_64-"
        + platformBinariesVersion
        + ".zip";
    var downloadBaseUrl = process.env.SONAR_NATIF_SCANNER_MIRROR || "https://github.com/henryju/bdd-scanner-natif/releases/download/";
    var downloadUrl = downloadBaseUrl + platformBinariesVersion + "/" + fileName;
    log("Downloading from " + downloadUrl);
    new Download({extract: true})
        .get(downloadUrl)
        .dest(installFolder)
        .use(downloadStatus())
        .run((err) => {
            if (err) {
                logError("Impossible to download and extract binary: " + err.message);
                throw err;
            }
            passExecutableCallback(platformExecutable);
        });
}

/*
 * Get the target OS based on the platform name
 */
function findTargetOS() {
    if (isWindows()) {
        return "win";
    }
    if (isLinux()) {
        return "linux";
    }
    if (isMac()) {
        return "mac";
    }
    throw Error("Your platform " + process.platform + "is currently not supported.")
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

function isLinux() {
    return /^linux/.test(process.platform);
}
