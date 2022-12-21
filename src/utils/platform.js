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
function isWindows() {
  return /^win/.test(process.platform);
}

function isMac() {
  return /^darwin/.test(process.platform);
}

function isLinux() {
  return /^linux/.test(process.platform);
}

/*
 * Get the target OS based on the platform name
 */
module.exports.findTargetOS = function () {
  if (isWindows()) {
    return 'windows';
  }
  if (isLinux()) {
    return 'linux';
  }
  if (isMac()) {
    return 'macosx';
  }
  throw Error(`Your platform '${process.platform}' is currently not supported.`);
};

module.exports.isWindows = isWindows;
module.exports.isMac = isMac;
module.exports.isLinux = isLinux;
