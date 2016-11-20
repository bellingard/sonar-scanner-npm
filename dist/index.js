var exec = require('child_process').execSync;
var log = require('fancy-log');
var prepareExecEnvironment = require('./sonarqube-scanner-executable').prepareExecEnvironment;
var sonarQubeExecutable = require('./sonarqube-scanner-executable').defineSonarQubeScannerExecutable;


module.exports = scan;

/*
 * Main function that actually triggers the analysis.
 */
function scan(params, callback) {
    log("Starting SonarQube analysis...");

    // prepare the exec options, most notably with the SQ params
    var options_exec = prepareExecEnvironment(params, process);

    // determine the command to run and execute it
    sonarQubeExecutable((sqScannerCommand) => {
        exec(sqScannerCommand, options_exec);
        log("SonarQube analysis finished.");
        callback();
    });
}
