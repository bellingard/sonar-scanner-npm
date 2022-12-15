const { getLatestSonarQube } = require('../dist/download');
const { createProject, generateToken, startAndReady, stop, getIssues } = require('../dist/sonarqube');

(async () => {
  try {
    const latest = await getLatestSonarQube();
    console.log('finished', latest);
    await startAndReady(latest);
    const token = await generateToken();
    console.log('got token', token);
    const projectKey = await createProject();
    console.log('got project', projectKey);
    const issues = await getIssues(projectKey);
    console.log('got issues', issues);
    stop(latest);
  } catch (error) {
    console.log('got err', error.response.data);
  }
})();
