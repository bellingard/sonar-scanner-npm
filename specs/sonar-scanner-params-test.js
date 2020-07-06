var assert = require('assert')
var path = require('path')
var sqScannerParams = require('../dist/sonar-scanner-params')

describe('sqScannerParams', function() {
  function pathForProject(projectFolder) {
    return path.join(process.cwd(), 'specs', 'resources', projectFolder)
  }

  var exclusions = 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**'

  it('should provide default values', function() {
    var expectedResult = {
      'sonar.projectDescription': 'No description.',
      'sonar.sources': '.',
      'sonar.exclusions': exclusions
    }
    assert.deepEqual(sqScannerParams({}, pathForProject('fake_project_with_no_package_file'), null), expectedResult)
  })

  it('should not set default values if sonar-project.properties file exists', function() {
    var expectedResult = {}
    assert.deepEqual(
      sqScannerParams({}, pathForProject('fake_project_with_sonar_properties_file'), null),
      expectedResult
    )
  })

  it('should propagate custom server and token', function() {
    var expectedResult = {
      'sonar.host.url': 'https://sonarcloud.io',
      'sonar.login': 'my_token',
      'sonar.projectDescription': 'No description.',
      'sonar.sources': '.',
      'sonar.exclusions': exclusions
    }
    assert.deepEqual(
      sqScannerParams(
        { serverUrl: 'https://sonarcloud.io', token: 'my_token' },
        pathForProject('fake_project_with_no_package_file'),
        null
      ),
      expectedResult
    )
  })

  it('should allow to override default settings and add new ones', function() {
    var expectedResult = {
      'sonar.projectName': 'Foo',
      'sonar.projectDescription': 'No description.',
      'sonar.sources': '.',
      'sonar.tests': 'specs',
      'sonar.exclusions': exclusions
    }
    assert.deepEqual(
      sqScannerParams(
        { options: { 'sonar.projectName': 'Foo', 'sonar.tests': 'specs' } },
        pathForProject('fake_project_with_no_package_file'),
        null
      ),
      expectedResult
    )
  })

  it('should get mandatory information from basic package.json file', function() {
    var expectedResult = {
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.projectKey': 'fake-basic-project',
      'sonar.projectName': 'fake-basic-project',
      'sonar.projectDescription': 'No description.',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': '.',
      'sonar.exclusions': 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**,coverage/**'
    }
    assert.deepEqual(sqScannerParams({}, pathForProject('fake_project_with_basic_package_file'), null), expectedResult)
  })

  it('should get mandatory information from scoped packages package.json file', function() {
    var expectedResult = {
      'sonar.projectKey': 'myfake-basic-project',
      'sonar.projectName': '@my/fake-basic-project',
      'sonar.projectDescription': 'No description.',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': '.',
      'sonar.exclusions': 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**'
    }
    assert.deepEqual(sqScannerParams({}, pathForProject('fake_project_with_scoped_package_name'), null), expectedResult)
  })

  it('should get all information from package.json file', function() {
    var expectedResult = {
      'sonar.projectKey': 'fake-project',
      'sonar.projectName': 'fake-project',
      'sonar.projectDescription': 'A fake project',
      'sonar.projectVersion': '1.0.0',
      'sonar.links.homepage': 'https://github.com/fake/project',
      'sonar.links.issues': 'https://github.com/fake/project/issues',
      'sonar.links.scm': 'git+https://github.com/fake/project.git',
      'sonar.sources': '.',
      'sonar.testExecutionReportPaths': 'xunit.xml',
      'sonar.exclusions': exclusions
    }
    assert.deepEqual(
      sqScannerParams({}, pathForProject('fake_project_with_complete_package_file'), null),
      expectedResult
    )
  })

  it('should take into account SONARQUBE_SCANNER_PARAMS env variable', function() {
    var expectedResult = {
      'sonar.host.url': 'https://sonarcloud.io',
      'sonar.login': 'my_token',
      'sonar.projectDescription': 'No description.',
      'sonar.sources': '.',
      'sonar.exclusions': exclusions
    }
    assert.deepEqual(
      sqScannerParams({}, pathForProject('fake_project_with_no_package_file'), {
        'sonar.host.url': 'https://sonarcloud.io',
        'sonar.login': 'my_token'
      }),
      expectedResult
    )
  })

  it('should make priority to user options over SONARQUBE_SCANNER_PARAMS env variable', function() {
    var expectedResult = {
      'sonar.host.url': 'https://sonarcloud.io',
      'sonar.login': 'my_token',
      'sonar.projectDescription': 'No description.',
      'sonar.sources': '.',
      'sonar.exclusions': exclusions
    }
    assert.deepEqual(
      sqScannerParams(
        { serverUrl: 'https://sonarcloud.io', token: 'my_token' },
        pathForProject('fake_project_with_no_package_file'),
        {
          'sonar.host.url': 'https://another.server.com',
          'sonar.login': 'another_token'
        }
      ),
      expectedResult
    )
  })

  it('should get nyc lcov file path from package.json file', function() {
    var expectedResult = {
      'sonar.javascript.lcov.reportPaths': 'nyc-coverage/lcov.info',
      'sonar.projectKey': 'fake-basic-project',
      'sonar.projectName': 'fake-basic-project',
      'sonar.projectDescription': 'No description.',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': '.',
      'sonar.exclusions': 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**,nyc-coverage/**'
    }
    assert.deepEqual(sqScannerParams({}, pathForProject('fake_project_with_nyc_report_file'), null), expectedResult)
  })

  it('should get jest lcov file path from package.json file', function() {
    var expectedResult = {
      'sonar.javascript.lcov.reportPaths': 'jest-coverage/lcov.info',
      'sonar.projectKey': 'fake-basic-project',
      'sonar.projectName': 'fake-basic-project',
      'sonar.projectDescription': 'No description.',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': '.',
      'sonar.exclusions': 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**,jest-coverage/**'
    }
    assert.deepEqual(sqScannerParams({}, pathForProject('fake_project_with_jest_report_file'), null), expectedResult)
  })
})
