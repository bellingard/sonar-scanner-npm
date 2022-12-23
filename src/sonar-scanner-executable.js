/*
 * sonar-scanner-npm
 * Copyright (C) 2022-2022 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
const exec = require('child_process').execSync;
const mkdirs = require('mkdirp').sync;
const { DownloaderHelper } = require('node-downloader-helper');
const decompress = require('decompress');
const ProgressBar = require('progress');
const log = require('fancy-log');
const logError = log.error;
const { isWindows } = require('./utils');
const { getExecutableParams } = require('./config');

module.exports.getSonarScannerExecutable = getSonarScannerExecutable;
module.exports.getLocalSonarScannerExecutable = getLocalSonarScannerExecutable;

const bar = new ProgressBar('[:bar] :percent :etas', {
  complete: '=',
  incomplete: ' ',
  width: 20,
  total: 0,
});

/*
 * Returns the SQ Scanner executable for the current platform
 */
async function getSonarScannerExecutable(params = {}) {
  const config = getExecutableParams(params);
  const { downloadUrl, httpOptions, platformExecutable, fileName, targetOS } = config;

  // #1 - Try to execute the scanner
  try {
    return getLocalSonarScannerExecutable(platformExecutable);
  } catch (e) {
    // ignore
  }

  const installFolder = config.installFolder;
  // #2 - Download the binaries and unzip them
  //      They are located at https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${version}-${os}.zip
  log('Proceed with download of the platform binaries for SonarScanner...');
  log('Creating ' + installFolder);
  mkdirs(installFolder);
  // SQ

  const downloader = new DownloaderHelper(downloadUrl, installFolder, httpOptions);
  // node-downloader-helper recommends defining both an onError and a catch because:
  //   "if on('error') is not defined, an error will be thrown when the error event is emitted and
  //    not listing, this is because EventEmitter is designed to throw an unhandled error event
  //    error if not been listened and is too late to change it now."
  downloader.on('error', error => {
    logError('error in downloader');
    logError(error);
  });
  downloader.on('download', downloadInfo => {
    bar.total = downloadInfo.totalSize;
  });
  downloader.on('progress', stats => {
    bar.update(stats.progress / 100);
  });
  try {
    await downloader.start();
    log('decompressing', `${installFolder}/${fileName}`, 'into', installFolder);
    await decompress(`${installFolder}/${fileName}`, installFolder);
    log('decompressed', platformExecutable);
    return platformExecutable;
  } catch (err) {
    logError(`ERROR: impossible to download and extract binary: ${err.message}`);
    logError(`       SonarScanner binaries probably don't exist for your OS (${targetOS}).`);
    logError(
      '       In such situation, the best solution is to install the standard SonarScanner (requires a JVM).',
    );
    logError(
      '       Check it out at https://redirect.sonarsource.com/doc/install-configure-scanner.html',
    );
  }
}

/**
 * Verifies if the provided (or default) command is executable
 * Throws otherwise
 *
 * @param {*} command the command to execute.
 * @returns the command to execute
 */
function getLocalSonarScannerExecutable(command = 'sonar-scanner') {
  try {
    log(`Trying to find a local install of the SonarScanner: ${command}`);
    exec(command + ' -v', {});
    // TODO: we should check that it's at least v2.8+
    log('Local install of Sonarscanner found.');
    return command;
  } catch (e) {
    throw Error(`Local install of SonarScanner not found in: ${command}`);
  }
}
