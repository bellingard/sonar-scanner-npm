var exec = require('child_process').execFileSync
var log = require('fancy-log')
var prepareExecEnvironment = require('./sonarqube-scanner-executable').prepareExecEnvironment
var sonarQubeExecutable = require('./sonarqube-scanner-executable').getSonarQubeScannerExecutable
var localSonarQubeExecutable = require('./sonarqube-scanner-executable').getLocalSonarQubeScannerExecutable

module.exports = scan
module.exports.cli = scanCLI
module.exports.customScanner = scanUsingCustomSonarQubeScanner

/*
 * Function used programmatically to trigger an analysis.
 */
function scan(params, callback) {
  scanCLI([], params, callback)
}

/*
 * Function used by the '/bin/sonar-scanner' executable that accepts command line arguments.
 */
function scanCLI(cliArgs, params, callback) {
  log('Starting SonarQube analysis...')

  // prepare the exec options, most notably with the SQ params
  var optionsExec = prepareExecEnvironment(params, process)

  // determine the command to run and execute it
  sonarQubeExecutable(sqScannerCommand => {
    try {
      exec(sqScannerCommand, cliArgs, optionsExec)
      log('SonarQube analysis finished.')
      callback()
    } catch (error) {
      process.exit(error.status)
    }
  })
}

/*
 * Alternatively, trigger an analysis with a local install of the SonarQube Scanner.
 */
function scanUsingCustomSonarQubeScanner(params, callback) {
  log('Starting SonarQube analysis (with local install of the SonarQube Scanner)...')

  // prepare the exec options, most notably with the SQ params
  var optionsExec = prepareExecEnvironment(params, process)

  // determine the command to run and execute it
  localSonarQubeExecutable(sqScannerCommand => {
    try {
      exec(sqScannerCommand, [], optionsExec)
      log('SonarQube analysis finished.')
      callback()
    } catch (error) {
      process.exit(error.status)
    }
  })
}
