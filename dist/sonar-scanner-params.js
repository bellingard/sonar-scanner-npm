var fs = require('fs')
var path = require('path')
var extend = require('extend')
var readPackage = require('read-pkg').sync
var slugify = require('slugify')
var log = require('fancy-log')
var get = require('lodash.get')
var uniq = require('lodash.uniq')

module.exports = defineSonarScannerParams

var invalidCharacterRegex = /[?$*+~.()'"!:@/]/g

/*
 * Try to be smart and guess most SQ parameters from JS files that
 * might exist - like 'package.json'.
 */
function defineSonarScannerParams(params, projectBaseDir, sqScannerParamsFromEnvVariable) {
  // #1 - set default values
  var sonarScannerParams = {}
  try {
    var sqFile = path.join(projectBaseDir, 'sonar-project.properties')
    fs.accessSync(sqFile, fs.F_OK)
    // there's a 'sonar-project.properties' file - no need to set default values
  } catch (e) {
    // No 'sonar-project.properties' file - let's add some default values
    extend(sonarScannerParams, {
      'sonar.projectDescription': 'No description.',
      'sonar.sources': '.',
      'sonar.exclusions': 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**'
    })

    // If there's a 'package.json' file, read it to grab info
    try {
      extractInfoFromPackageFile(sonarScannerParams, projectBaseDir)
    } catch (extractError) {
      // No 'package.json' file (or invalid one) - let's remain on the defaults
      log(`No 'package.json' file found (or no valid one): ${extractError.message}`)
      log('=> Using default settings.')
    }
  }

  // #2 - if SONARQUBE_SCANNER_PARAMS exists, extend the current params
  if (sqScannerParamsFromEnvVariable) {
    extend(sonarScannerParams, sqScannerParamsFromEnvVariable)
  }

  // #3 - check what's passed in the call params - these are prevalent params
  if (params.serverUrl) {
    sonarScannerParams['sonar.host.url'] = params.serverUrl
  }
  if (params.token) {
    sonarScannerParams['sonar.login'] = params.token
  }
  if (params.options) {
    extend(sonarScannerParams, params.options)
  }

  return sonarScannerParams
}

function extractInfoFromPackageFile(sonarScannerParams, projectBaseDir) {
  var packageFile = path.join(projectBaseDir, 'package.json')
  var pkg = readPackage(packageFile)
  log('Getting info from "package.json" file')
  function fileExistsInProjectSync(file) {
    return fs.existsSync(path.resolve(projectBaseDir, file))
  }
  function dependenceExists(pkgName) {
    return ['devDependencies', 'dependencies', 'peerDependencies'].some(function(prop) {
      return pkg[prop] && pkgName in pkg[prop]
    })
  }
  if (pkg) {
    sonarScannerParams['sonar.projectKey'] = slugify(pkg.name, {
      remove: invalidCharacterRegex
    })
    sonarScannerParams['sonar.projectName'] = pkg.name
    sonarScannerParams['sonar.projectVersion'] = pkg.version
    if (pkg.description) {
      sonarScannerParams['sonar.projectDescription'] = pkg.description
    }
    if (pkg.homepage) {
      sonarScannerParams['sonar.links.homepage'] = pkg.homepage
    }
    if (pkg.bugs && pkg.bugs.url) {
      sonarScannerParams['sonar.links.issues'] = pkg.bugs.url
    }
    if (pkg.repository && pkg.repository.url) {
      sonarScannerParams['sonar.links.scm'] = pkg.repository.url
    }

    uniq(
      [
        // jest coverage output directory
        // See: http://facebook.github.io/jest/docs/en/configuration.html#coveragedirectory-string
        'jest.coverageDirectory',
        // nyc coverage output directory
        // See: https://github.com/istanbuljs/nyc#configuring-nyc
        'nyc.report-dir'
      ]
        .map(function(aPath) {
          return get(pkg, aPath)
        })
        .filter(Boolean)
        .concat(
          // default coverage output directory
          'coverage'
        )
    ).find(function(lcovReportDir) {
      var lcovReportPath = path.posix.join(lcovReportDir, 'lcov.info')
      if (fileExistsInProjectSync(lcovReportPath)) {
        sonarScannerParams['sonar.exclusions'] += ',' + path.posix.join(lcovReportDir, '**')
        // https://docs.sonarqube.org/display/PLUG/JavaScript+Coverage+Results+Import
        sonarScannerParams['sonar.javascript.lcov.reportPaths'] = lcovReportPath
        // TODO: use Generic Test Data to remove dependence of SonarJS, it is need transformation lcov to sonar generic coverage format
        return true
      }
    })

    if (dependenceExists('mocha-sonarqube-reporter') && fileExistsInProjectSync('xunit.xml')) {
      // https://docs.sonarqube.org/display/SONAR/Generic+Test+Data
      sonarScannerParams['sonar.testExecutionReportPaths'] = 'xunit.xml'
    }
    // TODO: use `glob` to lookup xunit format files and transformation to sonar generic report format
  }
}
