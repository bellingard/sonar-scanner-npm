var gulp = require('gulp')
var istanbul = require('gulp-istanbul')
var mocha = require('gulp-mocha')
// Regular users will call 'require('sonarqube-scanner')' - but not here: eat your own dog food! :-)
var sonarqubeScanner = require('./dist/index')

gulp.task('default', ['test'], function(callback) {
  // We just run a SonarQube analysis and push it to SonarCloud
  // (No need to pass the server URL and the token, we're using the Travis
  //  Addon for SonarCloud which does this for you.)
  // ----------------------------------------------------
  sonarqubeScanner(
    {
      options: {
        'sonar.projectName': 'SonarScanner for NPM',
        'sonar.projectDescription': 'SonarQube/SonarCloud Scanner for the JavaScript world',
        'sonar.sources': 'dist',
        'sonar.tests': 'specs'
      }
    },
    callback
  )
  // ----------------------------------------------------
})

gulp.task('test', ['pre-test'], function() {
  let result = gulp
    .src(['specs/**/*.js'])
    .pipe(
      mocha(
        process.env.CI && {
          reporter: 'mocha-sonarqube-reporter'
        }
      )
    )
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
  return result
})

gulp.task('pre-test', function() {
  let result = gulp
    .src(['dist/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire())
  return result
})
