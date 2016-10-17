var exec = require('child_process').execSync;

module.exports = defineSonarQubeScannerExecutable;

/*
 * Returns the SQ Scanner executable:
 * - the one available in the PATH if it exists (meaning user has also JAVA)
 * - or the standalone JDK-9 binaries (that don't require JAVA on the box)
 */
function defineSonarQubeScannerExecutable() {
  var command = "sonar-scanner";
  if (isWindows()) {
    command += ".bat";
  }

  try {
    exec(command + " -v", {});
  } catch (e) {
    // sonar-scanner is not in the PATH => download the binaries for the
    // correct platform... but this is not supported for the moment.
    throw Error("SonarQube Scanner not found and impossible to download a compatible binary for it (yet!).");
  }

  return command;
}

/*
 * Some util functions...
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
