var assert = require('assert');
var path = require('path');
var sqScannerParams = require('../dist/sonarqube-scanner-params');

describe('sqScannerParams', function () {

    it('should provide default values', function () {
        var expectedResult = {
            "sonar.host.url": "http://localhost:9000",
            "sonar.login": "",
            "sonar.projectKey": "fake_project_with_no_package_file",
            "sonar.projectName": "fake_project_with_no_package_file",
            "sonar.projectDescription": "No description.",
            "sonar.projectVersion": "0.0.1",
            "sonar.sources": ".",
            "sonar.exclusions": "node_modules/**"
        };
        assert.deepEqual(
            sqScannerParams({}, pathForProject("fake_project_with_no_package_file"), null),
            expectedResult);
    });

    it('should propagate custom server and token', function () {
        var expectedResult = {
            "sonar.host.url": "https://sonarqube.com",
            "sonar.login": "my_token",
            "sonar.projectKey": "fake_project_with_no_package_file",
            "sonar.projectName": "fake_project_with_no_package_file",
            "sonar.projectDescription": "No description.",
            "sonar.projectVersion": "0.0.1",
            "sonar.sources": ".",
            "sonar.exclusions": "node_modules/**"
        };
        assert.deepEqual(
            sqScannerParams(
                {serverUrl: "https://sonarqube.com", token: "my_token"},
                pathForProject("fake_project_with_no_package_file"),
                null),
            expectedResult);
    });

    it('should allow to override default settings and add new ones', function () {
        var expectedResult = {
            "sonar.host.url": "http://localhost:9000",
            "sonar.login": "",
            "sonar.projectKey": "fake_project_with_no_package_file",
            "sonar.projectName": "Foo",
            "sonar.projectDescription": "No description.",
            "sonar.projectVersion": "0.0.1",
            "sonar.sources": ".",
            "sonar.tests": "specs",
            "sonar.exclusions": "node_modules/**"
        };
        assert.deepEqual(
            sqScannerParams(
                {options: {"sonar.projectName": "Foo", "sonar.tests": "specs"}},
                pathForProject("fake_project_with_no_package_file"),
                null),
            expectedResult);
    });

    it('should get mandatory information from  basic package.json file', function () {
        var expectedResult = {
            "sonar.host.url": "http://localhost:9000",
            "sonar.login": "",
            "sonar.projectKey": "fake-basic-project",
            "sonar.projectName": "fake-basic-project",
            "sonar.projectDescription": "No description.",
            "sonar.projectVersion": "1.0.0",
            "sonar.sources": ".",
            "sonar.exclusions": "node_modules/**"
        };
        assert.deepEqual(
            sqScannerParams({}, pathForProject("fake_project_with_basic_package_file"), null),
            expectedResult);
    });

    it('should get all information from package.json file', function () {
        var expectedResult = {
            "sonar.host.url": "http://localhost:9000",
            "sonar.login": "",
            "sonar.projectKey": "fake-project",
            "sonar.projectName": "fake-project",
            "sonar.projectDescription": "A fake project",
            "sonar.projectVersion": "1.0.0",
            "sonar.links.homepage": "https://github.com/fake/project",
            "sonar.links.issues": "https://github.com/fake/project/issues",
            "sonar.links.scm": "git+https://github.com/fake/project.git",
            "sonar.sources": ".",
            "sonar.exclusions": "node_modules/**"
        };
        assert.deepEqual(
            sqScannerParams({}, pathForProject("fake_project_with_complete_package_file"), null),
            expectedResult);
    });

    it('should take into account SONARQUBE_SCANNER_PARAMS env variable', function () {
        var expectedResult = {
            "sonar.host.url": "https://sonarqube.com",
            "sonar.login": "my_token",
            "sonar.projectKey": "fake_project_with_no_package_file",
            "sonar.projectName": "fake_project_with_no_package_file",
            "sonar.projectDescription": "No description.",
            "sonar.projectVersion": "0.0.1",
            "sonar.sources": ".",
            "sonar.exclusions": "node_modules/**"
        };
        assert.deepEqual(
            sqScannerParams(
                {},
                pathForProject("fake_project_with_no_package_file"),
                {"sonar.host.url": "https://sonarqube.com", "sonar.login": "my_token"}),
            expectedResult);
    });

    it('should make priority to user options over SONARQUBE_SCANNER_PARAMS env variable', function () {
        var expectedResult = {
            "sonar.host.url": "https://sonarqube.com",
            "sonar.login": "my_token",
            "sonar.projectKey": "fake_project_with_no_package_file",
            "sonar.projectName": "fake_project_with_no_package_file",
            "sonar.projectDescription": "No description.",
            "sonar.projectVersion": "0.0.1",
            "sonar.sources": ".",
            "sonar.exclusions": "node_modules/**"
        };
        assert.deepEqual(
            sqScannerParams(
                {serverUrl: "https://sonarqube.com", token: "my_token"},
                pathForProject("fake_project_with_no_package_file"),
                {"sonar.host.url": "https://another.server.com", "sonar.login": "another_token"}),
            expectedResult);
    });

});

function pathForProject(projectFolder) {
    return path.join(process.cwd(), "specs", "resources", projectFolder);
}
