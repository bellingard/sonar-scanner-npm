var exec = require('child_process').execSync;
var extend = require('extend');
var log = require('fancy-log');
var logError = log.error;

// local dependencies
var sonarQubeParams = require('./sonarqube-scanner-params');
var sonarQubeExecutable = require('./sonarqube-scanner-executable');


module.exports = scan;

/*
 * Main function that actually triggers the analysis.
 */
function scan(params, callback) {
    log("Starting SonarQube analysis...");

    // determine the set of parameters to pass to the SQ Scanner
    var sqScannerParams = sonarQubeParams(params);

    // prepare the exec options
    var options_exec = prepareExecEnvironment(sqScannerParams);

    // determine the command to run and execute it
    sonarQubeExecutable((sqScannerCommand) => {
        exec(sqScannerCommand, options_exec);
        log("SonarQube analysis finished.");
        callback();
    });

};

/*
 * Add everything required into the environment variables for the SQ Scanner
 * to get executed successfully.
 */
function prepareExecEnvironment(params) {
    var mergedEnv = {};

    // We need to merge the existing env variables (process.env) with the new ones
    extend(mergedEnv, process.env, {
        SONARQUBE_SCANNER_PARAMS: JSON.stringify(params)
    });

    // this is the actual object that the process.exec function is waiting for
    var options_exec = {
        env: mergedEnv,
        stdio: [0, 1, 2],
        // Increase the amount of data allowed on stdout or stderr
        // (if this value is exceeded then the child process is killed).
        // TODO: make this customizable
        maxBuffer: 1024 * 1024
    }

    return options_exec;
}
