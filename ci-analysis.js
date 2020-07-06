// Regular users will call 'require('sonarqube-scanner')' - but not here: eat your own dog food! :-)
const scanner = require('./dist/index')

// We just run an analysis and push it to SonarCloud
// (No need to pass the server URL and the token, we're using the Travis
//  Addon for SonarCloud which does this for you.)
// ---------
scanner(
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
