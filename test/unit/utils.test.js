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
