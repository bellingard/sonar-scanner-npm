var gulp = require('gulp');
var sonarqubeScanner = require('sonarqube-scanner');

gulp.task('default', function() {
  // We just run a SonarQube analysis and push it to SonarQube.com
  // ----------------------------------------------------
  sonarqubeScanner({
    serverUrl : process.env.SONARQUBE_URL,
    token: process.env.SONARQUBE_TOKEN,
    options : {}
  });
  // ----------------------------------------------------
});
