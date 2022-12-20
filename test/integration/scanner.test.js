// Regular users will call 'require('sonarqube-scanner')' - but not here: eat your own dog food! :-)
const { promise: scannerPromise } = require('../../src/index');
const path = require('path');
const { assert } = require('chai');
const {
  getLatestSonarQube,
  createProject,
  generateToken,
  startAndReady,
  stop,
  waitForAnalysisFinished,
  getIssues,
} = require('../../tools/orchestrator/dist');

const TIMEOUT_MS = 300_000;

describe('scanner', function () {
  describe('on local SonarQube', function () {
    let sqPath, token, projectKey;
    before(async function () {
      this.timeout(TIMEOUT_MS);
      sqPath = await getLatestSonarQube();
      await startAndReady(sqPath, TIMEOUT_MS);
      try {
        token = await generateToken();
        projectKey = await createProject();
      } catch (error) {
        console.log(error);
      }
    });
    after(function () {
      this.timeout(TIMEOUT_MS);
      stop(sqPath);
    });
    it('should run an analysis', async function () {
      await scannerPromise({
        serverUrl: 'http://localhost:9000',
        token,
        options: {
          'sonar.projectName': projectKey,
          'sonar.projectKey': projectKey,
          'sonar.sources': path.join(__dirname, '/resources/fake_project_for_integration/src'),
        },
      });
      await waitForAnalysisFinished(TIMEOUT_MS);
      const issues = await getIssues(projectKey);
      assert.equal(issues.length, 1);
      assert.deepEqual(issues[0].textRange, {
        startLine: 1,
        endLine: 1,
        startOffset: 0,
        endOffset: 7,
      });
    }).timeout(TIMEOUT_MS);
  });
});
