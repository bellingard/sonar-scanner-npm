const { getLatestSonarQube } = require('../dist/download');
const { startAndReady } = require('../dist/sonarqube');

(async () => {
  try {
    const latest = await getLatestSonarQube();
    console.log('finished', latest);
    await startAndReady(latest);
  } catch (error) {
    console.log('got err', error);
  }
})();
