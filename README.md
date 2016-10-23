# NPM module to run SonarQube analyses

`sonarqube-scanner` makes it very easy to trigger [SonarQube](http://www.sonarqube.org)
analyses on a JavaScript code base, without needing to install any specific tool
or (Java) runtime.

This module is analyzed on [SonarQube.com](https://sonarqube.com) using
itself:
- See the [Gulp file](https://github.com/bellingard/sonar-scanner-npm/blob/master/gulpfile.js)
- See the [analysis results on SonarQube.com](https://sonarqube.com/dashboard?id=sonarqube-scanner)

[![Build status](https://travis-ci.org/bellingard/sonar-scanner-npm.svg?branch=master)](https://travis-ci.org/bellingard/sonar-scanner-npm) [![Quality Gate](https://sonarqube.com/api/badges/gate?key=sonarqube-scanner)](https://sonarqube.com/dashboard/index/sonarqube-scanner)

## Installation

This package is available on [npm][npm-url] as: `sonarqube-scanner`

``` sh
npm install sonarqube-scanner
```

## Usage

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

**Syntax:** sonarqube-scanner **(** `parameters`, [`callback`] **)**

### Arguments

* `parameters` *Map*
  * `serverUrl` *String* (optional) The URL of the SonarQube server. Defaults to http://localhost:9000
  * `token` *String* (optional) The token used to connect to the SonarQube server. Empty by default.
  * `options` *Map* (optionl) Used to pass extra parameters for the SonarQube analysis. See the [official documentation](http://redirect.sonarsource.com/doc/analysis-parameters.html) for more details.
* `callback` *Function* (optional)
Callback (the execution of the analysis is asynchronous).

## License

`node-extend` is licensed under the [MIT License][mit-license-url].