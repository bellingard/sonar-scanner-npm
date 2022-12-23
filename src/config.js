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
const sonarScannerParams = require('./sonar-scanner-params');
const { findTargetOS, buildInstallFolderPath, buildExecutablePath } = require('./utils');
const os = require('os');
const log = require('fancy-log');
const HttpsProxyAgent = require('https-proxy-agent');

module.exports.getScannerParams = getScannerParams;
module.exports.extendWithExecParams = extendWithExecParams;
module.exports.getExecutableParams = getExecutableParams;

const DEFAULT_EXCLUSIONS =
  'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**';
module.exports.DEFAULT_EXCLUSIONS = DEFAULT_EXCLUSIONS;
const DEFAULT_SCANNER_VERSION = '4.7.0.2747';
module.exports.DEFAULT_SCANNER_VERSION = DEFAULT_SCANNER_VERSION;
const SONAR_SCANNER_MIRROR = 'https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/';
module.exports.SONAR_SCANNER_MIRROR = SONAR_SCANNER_MIRROR;

/**
 * Build the SONARQUBE_SCANNER_PARAMS which will be passed as an environment
 * variable to the scanner.
 *
 * @returns
 */
function getScannerParams(basePath, params = {}) {
  const config = {};

  const sqScannerParams = sonarScannerParams(
    params,
    basePath,
    process.env.SONARQUBE_SCANNER_PARAMS,
  );

  // We need to merge the existing env variables (process.env) with the SQ ones
  if (sqScannerParams) {
    config.SONARQUBE_SCANNER_PARAMS = sqScannerParams;
  }

  return config;
}

/**
 * Gather the parameters for sonar-scanner-executable:
 *  - installFolder
 *  - platformExecutable
 *  - downloadUrl
 *  - fileName
 *  - httpOptions, if proxy
 */
function getExecutableParams(params = {}) {
  const config = {};
  const env = process.env;

  const platformBinariesVersion =
    params.version ||
    env.SONAR_SCANNER_VERSION ||
    env.npm_config_sonar_scanner_version ||
    DEFAULT_SCANNER_VERSION;

  const targetOS = (config.targetOS = findTargetOS());

  const basePath =
    params.basePath || env.SONAR_BINARY_CACHE || env.npm_config_sonar_binary_cache || os.homedir();

  const installFolder = (config.installFolder = buildInstallFolderPath(basePath));
  config.platformExecutable = buildExecutablePath(installFolder, platformBinariesVersion);

  const baseUrl =
    params.baseUrl ||
    process.env.SONAR_SCANNER_MIRROR ||
    process.env.npm_config_sonar_scanner_mirror ||
    SONAR_SCANNER_MIRROR;
  const fileName = (config.fileName =
    'sonar-scanner-cli-' + platformBinariesVersion + '-' + targetOS + '.zip');
  config.downloadUrl = new URL(fileName, baseUrl).href;

  const proxy = process.env.http_proxy;
  if (proxy && proxy !== '') {
    const proxyAgent = new HttpsProxyAgent(proxy);
    config.httpOptions = {
      httpRequestOptions: { agent: proxyAgent },
      httpsRequestOptions: { agent: proxyAgent },
    };
  }
  log(`Executable parameters built:`);
  log(config);
  return config;
}

/**
 * Options for child_proces.exec()
 *
 * @param {*} env the environment variables
 * @returns
 */
function extendWithExecParams(env = {}) {
  const ONE_MB = 1024 * 1024;

  return {
    env: Object.assign({}, process.env, env),
    stdio: 'inherit',
    // Increase the amount of data allowed on stdout or stderr
    // (if this value is exceeded then the child process is killed).
    // TODO: make this customizable
    maxBuffer: ONE_MB,
  };
}
