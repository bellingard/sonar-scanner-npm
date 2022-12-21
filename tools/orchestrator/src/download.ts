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
import * as https from 'https';
import * as fs from 'fs';
import { execSync } from 'child_process';
import * as urlLib from 'url';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

const DEFAULT_VERSION: string = '9.7.1.62043';
const VERSIONS_URL: string = 'https://repox.jfrog.io/repox/api/search/versions?g=org.sonarsource.sonarqube&a=sonar-application&remote=0&repos=sonarsource-releases&v=*'
const CACHE_PATH: string = path.join(__dirname, '..', 'test', 'cache');
const DEFAULT_SONARQUBE_PATH: string = path.join(CACHE_PATH, 'sonarqube');

/**
 * Downloads the latest SonarQube Community edition
 * @param cacheFolder The folder where to look for potential SQs and where to download it
 * @returns the path to the folder where it was unpacked
 */
export async function getLatestSonarQube(cacheFolder: string = DEFAULT_SONARQUBE_PATH) {
  const version = await getLatestVersion();
  if (fs.existsSync(cacheFolder)) {
    const sonarqubes = fs.readdirSync(cacheFolder);
    const existingSq = sonarqubes.filter(sq => sq.includes(version));
    if (existingSq.length > 0) {
      const sqFolder = path.join(cacheFolder, existingSq[0]);
      console.log('Found cached version: ' + sqFolder);
      return sqFolder;
    }
  }
  return await download(version);
}

/**
 * Returns the last available SonarQube Community edition version
 *
 * @param url the URL where to get the existing community SQ versions
 */
function getLatestVersion(url: string = VERSIONS_URL): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      let responseData = '';
      response.on('data', data => {
        responseData += data;
      });
      response.on('close', () => {
        const { results: [ { version } ]} = JSON.parse(responseData);
        resolve(version);
      });
      response.on('error', error => {
        reject(error);
      });
    });
  })
}

/**
 * Downloads the file at the provided URL and saves it to the path ${downloadFolder}/sonarqube/
 *
 * @param version The SQ version to download
 * @param downloadFolder the folder where the zip is downloaded and unpacked
 * @returns the path to the folder where it was unpacked
 */
function download(version: string = DEFAULT_VERSION, downloadFolder: string = CACHE_PATH): Promise<string> {
  mkdirp.sync(downloadFolder);
  const url = buildSonarQubeUrl(version);
  const parsedUrl = urlLib.parse(url);
  const filename = path.basename(parsedUrl.pathname as string);
  const zipFilePath = path.join(downloadFolder, filename);
  const outputFolderPath = path.join(downloadFolder, 'sonarqube')

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(zipFilePath);
    console.log(`Downloading ${url} and saving it into ${zipFilePath}`)
    const request = https.get(url, response => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log("Download Completed");
        // change path for where to unzip this
        execSync(`unzip -o -q ${zipFilePath} -d ${outputFolderPath}`);
        console.log('unzipped in ', outputFolderPath);
        resolve(buildSonarQubePath(outputFolderPath));
      });
      file.on('error', (error: Error) => {
        reject(error);
      });
    });
  });
}

function buildSonarQubeUrl(version: string) {
  return `https://repox.jfrog.io/repox/sonarsource/org/sonarsource/sonarqube/sonar-application/${version}/sonar-application-${version}.zip`;
}

function buildSonarQubePath(folder: string) {
  const [sqDir] = fs.readdirSync(folder);
  return path.join(folder, sqDir);
}
