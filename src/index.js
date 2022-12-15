const exec = require('child_process').execFileSync;
const log = require('fancy-log');
const {
  prepareExecEnvironment,
  getSonarScannerExecutable,
  getLocalSonarScannerExecutable,
} = require('./sonar-scanner-executable');

module.exports = scan;
module.exports.promise = scanPromise;
module.exports.cli = scanCLI;
module.exports.customScanner = scanUsingCustomScanner;
module.exports.fromParam = fromParam;

const version = require('../package.json').version;

/*
 * Function used programmatically to trigger an analysis.
 */
function scan(params, callback) {
  scanCLI([], params, callback);
}

function scanPromise(params) {
  return new Promise((resolve, reject) => {
    log('Starting analysis...');

    // prepare the exec options, most notably with the SQ params
    const optionsExec = prepareExecEnvironment(params, process);

    // determine the command to run and execute it
    getSonarScannerExecutable(sqScannerCommand => {
      try {
        exec(sqScannerCommand, fromParam(), optionsExec);
        log('Analysis finished.');
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
}

/*
 * Function used by the '/bin/sonar-scanner' executable that accepts command line arguments.
 */
function scanCLI(cliArgs, params, callback) {
  log('Starting analysis...');

  // prepare the exec options, most notably with the SQ params
  const optionsExec = prepareExecEnvironment(params, process);

  // determine the command to run and execute it
  getSonarScannerExecutable(sqScannerCommand => {
    try {
      exec(sqScannerCommand, fromParam().concat(cliArgs), optionsExec);
      log('Analysis finished.');
      callback();
    } catch (error) {
      process.exit(error.status);
    }
  });
}

/*
 * Alternatively, trigger an analysis with a local install of the SonarScanner.
 */
function scanUsingCustomScanner(params, callback) {
  log('Starting analysis (with local install of the SonarScanner)...');

  // prepare the exec options, most notably with the SQ params
  const optionsExec = prepareExecEnvironment(params, process);

  // determine the command to run and execute it
  getLocalSonarScannerExecutable(sqScannerCommand => {
    try {
      exec(sqScannerCommand, fromParam(), optionsExec);
      log('Analysis finished.');
      callback();
    } catch (error) {
      process.exit(error.status);
    }
  });
}

function fromParam() {
  return [`--from=ScannerNpm/${version}`];
}
