const { assert } = require('chai');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs');
const os = require('os');
const mkdirpSync = require('mkdirp').sync;
const rimraf = require('rimraf');
const {
  prepareExecEnvironment,
  getSonarScannerExecutable,
  SONAR_SCANNER_VERSION,
} = require('../../src/sonar-scanner-executable');
const platformUtils = require('../../src/utils/platform');
const { buildInstallFolderPath, buildExecutablePath } = require('../../src/utils');

describe('sqScannerExecutable', function () {
  const exclusions = 'node_modules/**,bower_components/**,jspm_packages/**,typings/**,lib-cov/**';

  describe('prepareExecEnvironment()', function () {
    it('should provide default values', function () {
      const expectedResult = {
        maxBuffer: 1024 * 1024,
        stdio: [0, 1, 2],
        env: {
          SONARQUBE_SCANNER_PARAMS: JSON.stringify({
            'sonar.projectDescription': 'No description.',
            'sonar.sources': '.',
            'sonar.exclusions': exclusions,
          }),
        },
      };

      const fakeProcess = {
        env: {},
        cwd: function () {
          return pathForProject('fake_project_with_no_package_file');
        },
      };

      assert.deepEqual(prepareExecEnvironment({}, fakeProcess), expectedResult);
    });

    it('should read SONARQUBE_SCANNER_PARAMS provided by environment if it exists', function () {
      const expectedResult = {
        maxBuffer: 1024 * 1024,
        stdio: [0, 1, 2],
        env: {
          SONARQUBE_SCANNER_PARAMS: JSON.stringify({
            'sonar.projectDescription': 'No description.',
            'sonar.sources': '.',
            'sonar.exclusions': exclusions,
            'sonar.host.url': 'https://sonarcloud.io',
            'sonar.branch': 'dev',
          }),
        },
      };

      const fakeProcess = {
        env: {
          SONARQUBE_SCANNER_PARAMS: JSON.stringify({
            'sonar.host.url': 'https://sonarcloud.io',
            'sonar.branch': 'dev',
          }),
        },
        cwd: function () {
          return pathForProject('fake_project_with_no_package_file');
        },
      };

      assert.deepEqual(prepareExecEnvironment({}, fakeProcess), expectedResult);
    });
  });

  describe('getSonarScannerExecutable()', function () {
    it('should not execute callback when download of executable failed', function () {
      process.env.SONAR_SCANNER_MIRROR = 'http://fake.url/sonar-scanner';
      let executed = false;
      const callback = function () {
        executed = true;
      };

      getSonarScannerExecutable(callback);

      assert.equal(executed, false);
    });

    describe('when running on Windows', function () {
      it('run on Windows', function () {
        const stub = sinon.stub(platformUtils, 'isWindows');
        stub.returns(true);

        getSonarScannerExecutable(() => {});
        stub.restore();
      });
    });

    describe('when the executable exists', function () {
      let filepath;
      before(function () {
        filepath = buildExecutablePath(buildInstallFolderPath(os.homedir()), SONAR_SCANNER_VERSION);
        mkdirpSync(path.dirname(filepath));
        fs.writeFileSync(filepath, 'delete me');
      });
      after(function () {
        rimraf.sync(filepath);
      });
      it('should run the callback with it as parameter', function (done) {
        function callback(receivedExecutable) {
          assert.isTrue(receivedExecutable.includes('sonar-scanner'));
          done();
        }
        getSonarScannerExecutable(callback);
      });
    });
  });
});

function pathForProject(projectFolder) {
  return path.join(__dirname, 'resources', projectFolder);
}
