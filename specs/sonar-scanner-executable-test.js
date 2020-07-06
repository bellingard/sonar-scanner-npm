var assert = require('assert')
var path = require('path')
var index = require('../dist/sonar-scanner-executable')

describe('sqScannerExecutable', function() {
  var exclusions = 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**'

  it('should provide default values', function() {
    var expectedResult = {
      maxBuffer: 1024 * 1024,
      stdio: [0, 1, 2],
      env: {
        SONARQUBE_SCANNER_PARAMS: JSON.stringify({
          'sonar.projectDescription': 'No description.',
          'sonar.sources': '.',
          'sonar.exclusions': exclusions
        })
      }
    }

    var fakeProcess = {
      env: {},
      cwd: function() {
        return pathForProject('fake_project_with_no_package_file')
      }
    }

    assert.deepEqual(index.prepareExecEnvironment({}, fakeProcess), expectedResult)
  })

  it('should read SONARQUBE_SCANNER_PARAMS provided by environment if it exists', function() {
    var expectedResult = {
      maxBuffer: 1024 * 1024,
      stdio: [0, 1, 2],
      env: {
        SONARQUBE_SCANNER_PARAMS: JSON.stringify({
          'sonar.projectDescription': 'No description.',
          'sonar.sources': '.',
          'sonar.exclusions': exclusions,
          'sonar.host.url': 'https://sonarcloud.io',
          'sonar.branch': 'dev'
        })
      }
    }

    var fakeProcess = {
      env: {
        SONARQUBE_SCANNER_PARAMS: JSON.stringify({
          'sonar.host.url': 'https://sonarcloud.io',
          'sonar.branch': 'dev'
        })
      },
      cwd: function() {
        return pathForProject('fake_project_with_no_package_file')
      }
    }

    assert.deepEqual(index.prepareExecEnvironment({}, fakeProcess), expectedResult)
  })
})

describe('getSonarScannerExecutable', function() {
  it('should use SONAR_BINARY_CACHE env when exists', function() {
    process.env.SONAR_BINARY_CACHE = './test-cache'
    assert.equal(index.getInstallFolderPath(), 'test-cache/.sonar/native-sonar-scanner', 'congrats')
  })
})

function pathForProject(projectFolder) {
  return path.join(process.cwd(), 'specs', 'resources', projectFolder)
}
