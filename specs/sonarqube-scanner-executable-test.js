var assert = require('assert');
var path = require('path');
var index = require('../dist/sonarqube-scanner-executable');

describe('sqScannerParams', function () {

    it('should provide default values', function () {
        var expectedResult = {
            maxBuffer: 1024 * 1024,
            stdio: [0, 1, 2],
            env: {
                SONARQUBE_SCANNER_PARAMS: JSON.stringify({
                    "sonar.host.url": "http://localhost:9000",
                    "sonar.login": "",
                    "sonar.projectKey": "fake_project_with_no_package_file",
                    "sonar.projectName": "fake_project_with_no_package_file",
                    "sonar.projectVersion": "0.0.1",
                    "sonar.projectDescription": "No description.",
                    "sonar.sources": ".",
                    "sonar.exclusions": "node_modules/**"
                })
            }
        };

        var fakeProcess = {
            env: {},
            cwd: function () {
                return pathForProject("fake_project_with_no_package_file");
            }
        };

        assert.deepEqual(
            index.prepareExecEnvironment({}, fakeProcess),
            expectedResult);
    });

    it('should read SONARQUBE_SCANNER_PARAMS provided by environment if it exists', function () {
        var expectedResult = {
            maxBuffer: 1024 * 1024,
            stdio: [0, 1, 2],
            env: {
                SONARQUBE_SCANNER_PARAMS: JSON.stringify({
                    "sonar.host.url": "https://sonarqube.com",
                    "sonar.login": "",
                    "sonar.projectKey": "fake_project_with_no_package_file",
                    "sonar.projectName": "fake_project_with_no_package_file",
                    "sonar.projectVersion": "0.0.1",
                    "sonar.projectDescription": "No description.",
                    "sonar.sources": ".",
                    "sonar.exclusions": "node_modules/**",
                    "sonar.branch": "dev"
                })
            }
        };

        var fakeProcess = {
            env: {
                SONARQUBE_SCANNER_PARAMS: JSON.stringify({
                    "sonar.host.url": "https://sonarqube.com",
                    "sonar.branch": "dev"
                })
            },
            cwd: function () {
                return pathForProject("fake_project_with_no_package_file");
            }
        };

        assert.deepEqual(
            index.prepareExecEnvironment({}, fakeProcess),
            expectedResult);
    });

});

function pathForProject(projectFolder) {
    return path.join(process.cwd(), "specs", "resources", projectFolder);
}
