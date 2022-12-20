const path = require('node:path');
const { assert } = require('chai');
const { findTargetOS, buildInstallFolderPath } = require('../../src/utils');
const sinon = require('sinon');

describe('utils', function () {
  describe('findTargetOS()', function () {
    it('detect Windows', function () {
      const stub = sinon.stub(process, 'platform').value('windows10');

      assert.equal(findTargetOS(), 'windows');
      stub.restore();
    });

    it('detect Mac', function () {
      const stub = sinon.stub(process, 'platform').value('darwin');

      assert.equal(findTargetOS(), 'macosx');
      stub.restore();
    });

    it('detect Linux', function () {
      const stub = sinon.stub(process, 'platform').value('linux');

      assert.equal(findTargetOS(), 'linux');
      stub.restore();
    });

    it('throw if something else', function () {
      const stub = sinon.stub(process, 'platform').value('non-existing-os');

      assert.throws(findTargetOS.bind(null));
      stub.restore();
    });
  });

  describe('buildInstallFolderPath()', function () {
    it('should use SONAR_BINARY_CACHE env when exists', function () {
      const basePath = './test-cache';
      assert.equal(
        buildInstallFolderPath(basePath),
        path.join('test-cache', '.sonar', 'native-sonar-scanner'),
      );
    });
  });
});
