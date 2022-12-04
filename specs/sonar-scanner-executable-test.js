const assert = require('assert')
const path = require('path')
const index = require('../src/sonar-scanner-executable')

describe('sqScannerExecutable', function() {
  const exclusions = 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**'

  it('should provide default values', function() {
    const expectedResult = {
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

    const fakeProcess = {
      env: {},
      cwd: function() {
        return pathForProject('fake_project_with_no_package_file')
      }
    }

    assert.deepEqual(index.prepareExecEnvironment({}, fakeProcess), expectedResult)
  })

  it('should read SONARQUBE_SCANNER_PARAMS provided by environment if it exists', function() {
    const expectedResult = {
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

    const fakeProcess = {
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

  it('should not execute callback when download of executable failed', function() {
    process.env.SONAR_SCANNER_MIRROR = 'http://fake.url/sonar-scanner'
    let executed = false
    const callback = function() {
      executed = true
    }

    index.getSonarScannerExecutable(callback)

    assert.equal(executed, false)
  })
})

function pathForProject(projectFolder) {
  return path.join(process.cwd(), 'specs', 'resources', projectFolder)
}
