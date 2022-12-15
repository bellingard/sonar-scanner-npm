const { getIssues } = require('../dist/sonarqube');

(async () => {
  try {
    const issues = await getIssues('9pJ56DYSrO1');
    console.log('grat', issues);
  } catch (error) {
    console.log('got err', error.response.data);
  }
})();
