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
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const log = require('fancy-log');

module.exports = defineSonarScannerParams;

const invalidCharacterRegex = /[?$*+~.()'"!:@/]/g;

/*
 * Build the config.SONARQUBE_SCANNER_PARAMS property from:
 * 1. params
 *  serverUrl -> sonar.host.url
 *  token     -> sonar.login
 *  options to root
 * 2. the 'SONARQUBE_SCANNER_PARAMS' env variable
 *  all
 * 3. sonar-project-properties
 *  as-is
 * OR (TODO: make it hierarchical, not conditionnal)
 * 3. package.json (only some other fields)
 *  slug(name)      -> sonar.projectKey
 *  name            -> sonar.projectName
 *  version         -> sonar.projectVersion
 *  description     -> sonar.projectDescription
 *  homepage        -> sonar.links.homepage
 *  bugs.url        -> sonar.links.issue
 *  repository.url  -> sonar.links.scm
 *  pick up nyc/jest and append them to existing sonar.exclusions
 *  some logic aroung sonar.javascript.lcov.reportPaths
 *  same for sonar.testExecutionReportPaths
 *  same for sonar.testExecutionReportPaths
 * 4. default values (same)
 *  sonar.projectDescription
 *  sonar.sources
 *  sonar.exclusions
 *
 * returns it stringified
 *
 * Try to be smart and guess most SQ parameters from JS files that
 * might exist - like 'package.json'.
 */
function defineSonarScannerParams(params, projectBaseDir, sqScannerParamsFromEnvVariable) {
  // #1 - set default values
  let sonarScannerParams = {};
  try {
    const sqFile = path.join(projectBaseDir, 'sonar-project.properties');
    fs.accessSync(sqFile, fs.F_OK);
    // there's a 'sonar-project.properties' file - no need to set default values
  } catch (e) {
    sonarScannerParams = {
      'sonar.projectDescription': 'No description.',
      'sonar.sources': '.',
      'sonar.exclusions':
        'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**',
    };
    // If there's a 'package.json' file, read it to grab info
    try {
      sonarScannerParams = Object.assign(
        {},
        sonarScannerParams,
        extractInfoFromPackageFile(projectBaseDir, sonarScannerParams['sonar.exclusions']),
      );
    } catch (extractError) {
      // No 'package.json' file (or invalid one) - let's remain on the defaults
      log(`No 'package.json' file found (or no valid one): ${extractError.message}`);
      log('=> Using default settings.');
    }
  }

  // #2 - if SONARQUBE_SCANNER_PARAMS exists, extend the current params
  if (sqScannerParamsFromEnvVariable) {
    sonarScannerParams = Object.assign(
      {},
      sonarScannerParams,
      JSON.parse(sqScannerParamsFromEnvVariable),
    );
  }

  // #3 - check what's passed in the call params - these are prevalent params
  if (params.serverUrl) {
    sonarScannerParams['sonar.host.url'] = params.serverUrl;
  }
  if (params.token) {
    sonarScannerParams['sonar.login'] = params.token;
  }
  if (params.options) {
    sonarScannerParams = Object.assign(sonarScannerParams, params.options);
  }

  if (!isEmpty(sonarScannerParams)) {
    return JSON.stringify(sonarScannerParams);
  } else {
    return null;
  }
}

function isEmpty(jsObject) {
  return jsObject.constructor === Object && Object.entries(jsObject).length === 0;
}

/**
 * Build the config.
 *
 * @param {*} projectBaseDir
 */
function extractInfoFromPackageFile(projectBaseDir, exclusions) {
  const packageJsonParams = {};
  const packageFile = path.join(projectBaseDir, 'package.json');
  const packageData = fs.readFileSync(packageFile);
  const pkg = JSON.parse(packageData);
  log('Retrieving info from "package.json" file');
  function fileExistsInProjectSync(file) {
    return fs.existsSync(path.resolve(projectBaseDir, file));
  }
  function dependenceExists(pkgName) {
    return ['devDependencies', 'dependencies', 'peerDependencies'].some(function (prop) {
      return pkg[prop] && pkgName in pkg[prop];
    });
  }
  if (pkg) {
    packageJsonParams['sonar.projectKey'] = slugify(pkg.name, {
      remove: invalidCharacterRegex,
    });
    packageJsonParams['sonar.projectName'] = pkg.name;
    packageJsonParams['sonar.projectVersion'] = pkg.version;
    if (pkg.description) {
      packageJsonParams['sonar.projectDescription'] = pkg.description;
    }
    if (pkg.homepage) {
      packageJsonParams['sonar.links.homepage'] = pkg.homepage;
    }
    if (pkg.bugs?.url) {
      packageJsonParams['sonar.links.issue'] = pkg.bugs.url;
    }
    if (pkg.repository?.url) {
      packageJsonParams['sonar.links.scm'] = pkg.repository.url;
    }

    const potentialCoverageDirs = [
      // jest coverage output directory
      // See: http://facebook.github.io/jest/docs/en/configuration.html#coveragedirectory-string
      pkg['nyc']?.['report-dir'],
      // nyc coverage output directory
      // See: https://github.com/istanbuljs/nyc#configuring-nyc
      pkg['jest']?.['coverageDirectory'],
    ]
      .filter(Boolean)
      .concat(
        // default coverage output directory
        'coverage',
      );
    const uniqueCoverageDirs = Array.from(new Set(potentialCoverageDirs));
    packageJsonParams['sonar.exclusions'] = exclusions;
    for (const lcovReportDir of uniqueCoverageDirs) {
      const lcovReportPath = path.posix.join(lcovReportDir, 'lcov.info');
      if (fileExistsInProjectSync(lcovReportPath)) {
        packageJsonParams['sonar.exclusions'] += ',' + path.posix.join(lcovReportDir, '**');
        // https://docs.sonarqube.org/display/PLUG/JavaScript+Coverage+Results+Import
        packageJsonParams['sonar.javascript.lcov.reportPaths'] = lcovReportPath;
        // TODO: use Generic Test Data to remove dependence of SonarJS, it is need transformation lcov to sonar generic coverage format
      }
    }

    if (dependenceExists('mocha-sonarqube-reporter') && fileExistsInProjectSync('xunit.xml')) {
      // https://docs.sonarqube.org/display/SONAR/Generic+Test+Data
      packageJsonParams['sonar.testExecutionReportPaths'] = 'xunit.xml';
    }
    // TODO: use `glob` to lookup xunit format files and transformation to sonar generic report format
  }
  return packageJsonParams;
}
