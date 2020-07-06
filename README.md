# NPM module to run SonarQube/SonarCloud analyses

`sonarqube-scanner` makes it very easy to trigger [SonarQube](https://www.sonarqube.org)
/ [SonarCloud](https://sonarcloud.io) analyses on a JavaScript code base, without needing 
to install any specific tool or (Java) runtime.

This module is analyzed on SonarCloud.

[![Build status](https://travis-ci.org/bellingard/sonar-scanner-npm.svg?branch=master)](https://travis-ci.org/bellingard/sonar-scanner-npm) [![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=bellingard_sonar-scanner-npm&metric=alert_status)](https://sonarcloud.io/dashboard/index/bellingard_sonar-scanner-npm) [![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=bellingard_sonar-scanner-npm&metric=sqale_rating)](https://sonarcloud.io/dashboard/index/bellingard_sonar-scanner-npm) [![Reliability](https://sonarcloud.io/api/project_badges/measure?project=bellingard_sonar-scanner-npm&metric=reliability_rating)](https://sonarcloud.io/dashboard/index/bellingard_sonar-scanner-npm) [![Security](https://sonarcloud.io/api/project_badges/measure?project=bellingard_sonar-scanner-npm&metric=security_rating)](https://sonarcloud.io/dashboard/index/bellingard_sonar-scanner-npm) [![Releases](https://img.shields.io/github/release/bellingard/sonar-scanner-npm.svg)](https://github.com/bellingard/sonar-scanner-npm/releases) [![Coverage Status](https://coveralls.io/repos/github/bellingard/sonar-scanner-npm/badge.svg)](https://coveralls.io/github/bellingard/sonar-scanner-npm)


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
project, and pushing the results to a SonarQube instance:

```javascript
const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl : 'https://sonarqube.mycompany.com',
    token : "019d1e2e04eefdcd0caee1468f39a45e69d33d3f",
    options: {
      'sonar.projectName': 'My App',
      'sonar.projectDescription': 'Description for "My App" project...',
      'sonar.sources': 'dist',
      'sonar.tests': 'specs'
    }
  },
  () => process.exit()
)
```

**Syntax:** sonarqube-scanner **(** `parameters`, [`callback`] **)**

**Arguments**

* `parameters` *Map*
  * `serverUrl` *String* (optional) The URL of the SonarQube server. Defaults to http://localhost:9000
  * `token` *String* (optional) The token used to connect to the SonarQube/SonarCloud server. Empty by default.
  * `options` *Map* (optional) Used to pass extra parameters for the analysis. See the [official documentation](http://redirect.sonarsource.com/doc/analysis-parameters.html) for more details.
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
* If there's a `sonar-project.properties` file in the folder, it will behave like the [original SonarScanner](https://redirect.sonarsource.com/doc/install-configure-scanner.html)
* Additional [analysis parameters](https://redirect.sonarsource.com/doc/analysis-parameters.html) can be passed on the command line using the standard `-Dsonar.xxx=yyy` syntax
  * Example: 
  
    `sonar-scanner -Dsonar.host.url=https://myserver.com -Dsonar.login=019d1e2e04e`

## FAQ

#### *I constantly get "Impossible to download and extract binary [...] In such situation, the best solution is to install the standard SonarScanner", what can I do?*

You can install manually the [standard SonarScanner](https://redirect.sonarsource.com/doc/install-configure-scanner.html),
which requires to have a Java Runtime Environment available too (Java 8+). Once this is done, you can replace the 2nd line
of the example by:

```javascript
var scanner = require('sonarqube-scanner').customScanner;
```

### In my Docker container, the scanner fails with ".../jre/bin/java: not found", how do I solve this?

You are probably relying on Alpine for your Docker image, and Alpine does not include glibc by default. 
It needs to be [installed manually](https://ghost.kontena.io/docker-for-mac-glibc-issues/).

Thanks to [Philipp Eschenbach](https://github.com/peh) for troubleshooting this on [issue #59](https://github.com/bellingard/sonar-scanner-npm/issues/59).

## Download From Mirrors

By default, the scanner binaries are downloaded from `https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/`.
To use a custom mirror, set `$SONAR_SCANNER_MIRROR`. Or download precise version with `$SONAR_SCANNER_VERSION`

**Example:**
```shell
export SONAR_SCANNER_MIRROR=https://npm.taobao.org/mirrors/sonar-scanner/
export SONAR_SCANNER_VERSION=3.2.0.1227
```

or alternatively set variable in `.npmrc`

```
    sonar_scanner_mirror=https://npm.taobao.org/mirrors/sonar-scanner/
    sonar_scanner_version=3.2.0.1227
```

## Specifying the cache folder

By default, the scanner binaries are cached into `$HOME/.sonar/native-sonar-scanner` folder.
To use a custom cache fodler instead of `$HOME`, set `$SONAR_BINARY_CACHE`.

**Example:**
```shell
export SONAR_BINARY_CACHE=/Users/myaccount/cache
```

or alternatively set variable in `.npmrc`

```
    sonar_binary_cache=/Users/myaccount/cache
```

## License

`sonarqube-scanner` is licensed under the [LGPL v3 License](http://www.gnu.org/licenses/lgpl.txt).
