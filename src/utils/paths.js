const path = require('path');
const { isWindows, findTargetOS } = require('./platform');

module.exports.buildExecutablePath = function (installFolder, platformBinariesVersion) {
  return path.join(
    installFolder,
    `sonar-scanner-${platformBinariesVersion}-${findTargetOS()}`,
    'bin',
    `sonar-scanner${getBinaryExtension()}`,
  );
};

module.exports.buildInstallFolderPath = function (basePath) {
  return path.join(basePath, '.sonar', 'native-sonar-scanner');
};

function getBinaryExtension() {
  if (isWindows()) {
    return '.bat';
  } else {
    return '';
  }
}
