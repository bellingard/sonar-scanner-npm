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
const { assert } = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');
const mkdirpSync = require('mkdirp').sync;
const rimraf = require('rimraf');
const {
  getSonarScannerExecutable,
  getLocalSonarScannerExecutable,
} = require('../../src/sonar-scanner-executable');
const { DEFAULT_SCANNER_VERSION, getExecutableParams } = require('../../src/config');
const { buildInstallFolderPath, buildExecutablePath } = require('../../src/utils');
const { startServer, closeServerPromise } = require('./resources/webserver/server');

describe('sqScannerExecutable', function () {
  describe('getSonarScannerExecutable()', function () {
    it('should return null when the download of executable fails', async function () {
      process.env.SONAR_SCANNER_MIRROR = 'http://fake.url/sonar-scanner';
      const executable = await getSonarScannerExecutable({
        basePath: os.tmpdir(),
      });

      assert.equal(executable, null);
    });

    describe('when the executable exists', function () {
      let filepath;
      before(function () {
        filepath = buildExecutablePath(
          buildInstallFolderPath(os.tmpdir()),
          DEFAULT_SCANNER_VERSION,
        );
        mkdirpSync(path.dirname(filepath));
        fs.writeFileSync(filepath, 'echo "hello"');
        fs.chmodSync(filepath, 0o700);
      });
      after(function () {
        rimraf.sync(filepath);
      });
      it('should return the path to it', async function () {
        const receivedExecutable = await getSonarScannerExecutable({
          basePath: os.tmpdir(),
        });
        assert.equal(receivedExecutable, filepath);
      });
    });

    describe('when the executable is downloaded', function () {
      let server, config, pathToZip, pathToUnzippedExecutable, expectedPlatformExecutablePath;
      const FILENAME = 'test-executable.zip';
      before(async function () {
        server = await startServer();
        config = getExecutableParams({ fileName: FILENAME });
        expectedPlatformExecutablePath = config.platformExecutable;
      });
      after(async function () {
        await closeServerPromise(server);
        pathToZip = path.join(config.installFolder, config.fileName);
        pathToUnzippedExecutable = path.join(config.installFolder, 'executable');
        rimraf.sync(pathToZip);
        rimraf.sync(pathToUnzippedExecutable);
      });
      it('should download the executable, unzip it and return a path to it.', async function () {
        const execPath = await getSonarScannerExecutable({
          baseUrl: `http://${server.address().address}:${server.address().port}`,
          fileName: FILENAME,
        });
        assert.equal(execPath, expectedPlatformExecutablePath);
      });
    });
  });

  describe('getLocalSonarScannerExecutable', () => {
    it('should fail when the executable is not found', () => {
      assert.throws(
        getLocalSonarScannerExecutable,
        'Local install of SonarScanner not found in: sonar-scanner',
      );
    });
  });
});
