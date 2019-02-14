# NPM module to run SonarQube/SonarCloud analyses

`sonarqube-scanner` makes it very easy to trigger [SonarQube](https://www.sonarqube.org)
/ [SonarCloud](https://sonarcloud.io) analyses on a JavaScript code base, without needing 
to install any specific tool or (Java) runtime.

This module is analyzed on SonarCloud using
itself:
- See the [Gulp file](https://github.com/bellingard/sonar-scanner-npm/blob/master/gulpfile.js)
- See the [analysis results on SonarCloud](https://sonarcloud.io/dashboard?id=sonarqube-scanner)

[![Build status](https://travis-ci.org/bellingard/sonar-scanner-npm.svg?branch=master)](https://travis-ci.org/bellingard/sonar-scanner-npm) [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=sonarqube-scanner&metric=alert_status)](https://sonarcloud.io/dashboard/index/sonarqube-scanner) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=sonarqube-scanner&metric=coverage)](https://sonarcloud.io/dashboard/index/sonarqube-scanner) [![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=sonarqube-scanner&metric=sqale_rating)](https://sonarcloud.io/dashboard/index/sonarqube-scanner) [![Reliability](https://sonarcloud.io/api/project_badges/measure?project=sonarqube-scanner&metric=reliability_rating)](https://sonarcloud.io/dashboard/index/sonarqube-scanner) [![Security](https://sonarcloud.io/api/project_badges/measure?project=sonarqube-scanner&metric=security_rating)](https://sonarcloud.io/dashboard/index/sonarqube-scanner) [![Releases](https://img.shields.io/github/release/bellingard/sonar-scanner-npm.svg)](https://github.com/bellingard/sonar-scanner-npm/releases)


## Installation

This package is available on npm as: `sonarqube-scanner`

To add code analysis to your build files, simply add the package to your project dev dependencies:

``` sh
npm install -D sonarqube-scanner
```

To install the scanner globally and be able to run analyses on the command line:

``` sh
npm install -g sonarqube-scanner
```

## Usage: add code analysis to your build files

_Prerequisite: you've installed the package as a dev dependency._

The following example shows how to run an analysis on a JavaScript
project using Gulp, and pushing the results to [SonarCloud](https://sonarcloud.io),
the online code-analysis service based on SonarQube:

```javascript
var gulp = require('gulp');
var sonarqubeScanner = require('sonarqube-scanner');

gulp.task('default', function(callback) {
  sonarqubeScanner({
    serverUrl : "https://sonarcloud.io",
    token : "019d1e2e04eefdcd0caee1468f39a45e69d33d3f",
    options : {
      "sonar.organization": "my-org"
    }
  }, callback);
});
```

**Syntax:** sonarqube-scanner **(** `parameters`, [`callback`] **)**

**Arguments**

* `parameters` *Map*
  * `serverUrl` *String* (optional) The URL of the SonarQube server. Defaults to http://localhost:9000
  * `token` *String* (optional) The token used to connect to the SonarQube server. Empty by default.
  * `options` *Map* (optional) Used to pass extra parameters for the SonarQube analysis. See the [official documentation](http://redirect.sonarsource.com/doc/analysis-parameters.html) for more details.
* `callback` *Function* (optional)
Callback (the execution of the analysis is asynchronous).

## Usage: run analyses on the command line

_Prerequisite: you've installed the package globally._

If you want to run an analysis without having to configure anything in the first place, simply run the `sonar-scanner` command. The following
example assumes that you have installed SonarQube locally:

```
cd my-project
sonar-scanner
```

**Specifying properties/settings**

* If there's a `package.json` file in the folder, it will be read to feed the analysis with basic information (like project name or version)
* If there's a `sonar-project.properties` file in the folder, it will behave like the [original SonarQube Scanner](https://redirect.sonarsource.com/doc/install-configure-scanner.html)
* Additional [analysis parameters](https://redirect.sonarsource.com/doc/analysis-parameters.html) can be passed on the command line using the standard `-Dsonar.xxx=yyy` syntax
  * Example: 
  
    `sonar-scanner -Dsonar.host.url=https://myserver.com -Dsonar.login=019d1e2e04e`

## FAQ

#### *I constantly get "Impossible to download and extract binary [...] In such situation, the best solution is to install the standard SonarQube Scanner", what can I do?*

You can install manually the [standard SonarQube Scanner](https://redirect.sonarsource.com/doc/install-configure-scanner.html),
which requires to have a Java Runtime Environment available too (Java 8+). Once this is done, you can replace the 2nd line
of the example by:

```javascript
var sonarqubeScanner = require('sonarqube-scanner').customScanner;
```

### In my Docker container, the scanner fails with ".../jre/bin/java: not found", how do I solve this?

You are probably relying on Alpine for your Docker image, and Alpine does not include glibc by default. 
It needs to be [installed manually](https://ghost.kontena.io/docker-for-mac-glibc-issues/).

Thanks to [Philipp Eschenbach](https://github.com/peh) for troubleshooting this on [issue #59](https://github.com/bellingard/sonar-scanner-npm/issues/59).

## Download From Mirrors

By default, SonarQube scanner binaries are downloaded from `https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/`.
To use a custom mirror, set `$SONAR_SCANNER_MIRROR`.

**Example:**
```shell
export SONAR_SCANNER_MIRROR=https://npm.taobao.org/mirrors/sonar-scanner/
```

## License

`sonarqube-scanner` is licensed under the [LGPL v3 License](http://www.gnu.org/licenses/lgpl.txt).
