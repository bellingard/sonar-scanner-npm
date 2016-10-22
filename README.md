# NPM module to run SonarQube analyses

This NPM module makes it very easy to trigger [SonarQube](http://www.sonarqube.org)
analyses on a JavaScript code base, without needing to install any specific tool
or (Java) runtime.

The following example shows how to run a SonarQube analysis on a JavaScript
project using Gulp, and pushing the results to [SonarQube.com](https://sonarqube.com),
the online SonarQube service:

```javascript
var gulp = require('gulp');
var sonarqubeScanner = require('sonarqube-scanner');

gulp.task('default', function(callback) {
  sonarqubeScanner({
    serverUrl : "https://sonarqube.com",
    token : "019d1e2e04eefdcd0caee1468f39a45e69d33d3f",
    options : {}
  }, callback);
});
```

This NPM module is analyzed on [SonarQube.com](https://sonarqube.com) using
itself:
- See the [Gulp file](https://github.com/bellingard/sonar-scanner-npm/blob/master/gulpfile.js)
- See the [analysis results on SonarQube.com](https://sonarqube.com/dashboard?id=sonarqube-scanner)

[![Build status](https://travis-ci.org/bellingard/sonar-scanner-npm.svg?branch=master)](https://travis-ci.org/bellingard/sonar-scanner-npm) [![Quality Gate](https://sonarqube.com/api/badges/gate?key=sonarqube-scanner)](https://sonarqube.com/dashboard/index/sonarqube-scanner)
