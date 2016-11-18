var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var sonarqubeScanner = require('sonarqube-scanner');

gulp.task('default', ['test'], function (callback) {
    // We just run a SonarQube analysis and push it to SonarQube.com
    // (No need to pass the server URL and the token, we're using the Travis 
    //  Addon for SonarQube.com which does this for you.)
    // ----------------------------------------------------
    sonarqubeScanner({
        options: {
            "sonar.projectName": "SonarQube Scanner for the JavaScript world",
            "sonar.sources": "dist",
            "sonar.tests": "specs",
            "sonar.javascript.lcov.reportPath": "coverage/lcov.info"
        }
    }, callback);
    // ----------------------------------------------------
});

gulp.task('test', ['pre-test'], function () {
    return gulp.src(['specs/**/*.js'])
        .pipe(mocha())
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports());
});

gulp.task('pre-test', function () {
    return gulp.src(['dist/**/*.js'])
    // Covering files
        .pipe(istanbul())
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});
