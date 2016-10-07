var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var os = require('os');
var format = require('util').format;
var extend = require('extend');
var log = require('fancy-log');
var logError = log.error;

module.exports = function (options) {
    log("Starting SonarQube analysis...");

    var sonarqubeScannerParams = {
      "sonar.projectKey" : "test",
      "sonar.sources" : "."
    };

    var SONAR_SCANNER_COMMAND = "sonar-scanner"
    //var SONAR_SCANNER_COMMAND = "echo $SONARQUBE_SCANNER_PARAMS"

    var mergedEnv = {};
    extend(mergedEnv, process.env, {
      SONARQUBE_SCANNER_PARAMS : JSON.stringify(sonarqubeScannerParams)
    });

    var options_exec = {
        env : mergedEnv,
        // Increase the amount of data allowed on stdout or stderr
        // (if this value is exceeded then the child process is killed).
        // TODO: make this customizable
        maxBuffer : 1024*1024
    }

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
