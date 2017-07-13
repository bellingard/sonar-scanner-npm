# NPM module to run SonarQube analyses

`sonarqube-scanner` makes it very easy to trigger [SonarQube](http://www.sonarqube.org)
analyses on a JavaScript code base, without needing to install any specific tool
or (Java) runtime.

This module is analyzed on [SonarCloud](https://sonarcloud.io) using
itself:
- See the [Gulp file](https://github.com/bellingard/sonar-scanner-npm/blob/master/gulpfile.js)
- See the [analysis results on SonarCloud](https://sonarcloud.io/dashboard?id=sonarqube-scanner)

[![Build status](https://travis-ci.org/bellingard/sonar-scanner-npm.svg?branch=master)](https://travis-ci.org/bellingard/sonar-scanner-npm) [![Quality Gate](https://sonarcloud.io/api/badges/gate?key=sonarqube-scanner)](https://sonarcloud.io/dashboard/index/sonarqube-scanner)

## Installation

This package is available on npm as: `sonarqube-scanner`

``` sh
npm install sonarqube-scanner
```

## Usage

The following example shows how to run a SonarQube analysis on a JavaScript
project using Gulp, and pushing the results to [SonarCloud](https://sonarcloud.io),
the online SonarQube service:

```javascript
var gulp = require('gulp');
var sonarqubeScanner = require('sonarqube-scanner');

gulp.task('default', function(callback) {
  sonarqubeScanner({
    serverUrl : "https://sonarcloud.io",
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
  * `options` *Map* (optional) Used to pass extra parameters for the SonarQube analysis. See the [official documentation](http://redirect.sonarsource.com/doc/analysis-parameters.html) for more details.
* `callback` *Function* (optional)
Callback (the execution of the analysis is asynchronous).

## FAQ

#### *I constantly get "Impossible to download and extract binary [...] In such situation, the best solution is to install the standard SonarQube Scanner", what can I do?*

You can install manually the [standard SonarQube Scanner](https://redirect.sonarsource.com/doc/install-configure-scanner.html),
which requires to have a Java Runtime Environment available too (Java 8+). Once this is done, you can replace the 2nd line
of the example by:

```javascript
var sonarqubeScanner = require('sonarqube-scanner').customScanner;
```

## License

`sonarqube-scanner` is licensed under the [LGPL v3 License](http://www.gnu.org/licenses/lgpl.txt).
