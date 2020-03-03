// Regular users will call 'require('sonarqube-scanner')' - but not here: eat your own dog food! :-)
const sonarqubeScanner = require('./dist/index')

// We just run a SonarQube analysis and push it to SonarCloud
// (No need to pass the server URL and the token, we're using the Travis
//  Addon for SonarCloud which does this for you.)
// ---------
sonarqubeScanner(
  {
    options: {
      'sonar.projectName': 'SonarScanner for NPM',
      'sonar.projectDescription': 'SonarQube/SonarCloud Scanner for the JavaScript world',
      'sonar.sources': 'dist',
      'sonar.tests': 'specs'
    }
  },
  () => process.exit()
)
