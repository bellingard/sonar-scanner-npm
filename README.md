# NPM module to run SonarQube/SonarCloud analyses

`sonarqube-scanner` makes it very easy to trigger [SonarQube](https://www.sonarqube.org)
/ [SonarCloud](https://sonarcloud.io) analyses on a JavaScript code base, without needing
to install any specific tool or (Java) runtime.

This module is analyzed on SonarCloud.

[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=SonarSource_sonar-scanner-npm&metric=alert_status)](https://sonarcloud.io/project/overview?id=SonarSource_sonar-scanner-npm) [![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=SonarSource_sonar-scanner-npm&metric=sqale_rating)](https://sonarcloud.io/project/overview?id=SonarSource_sonar-scanner-npm) [![Reliability](https://sonarcloud.io/api/project_badges/measure?project=SonarSource_sonar-scanner-npm&metric=reliability_rating)](https://sonarcloud.io/project/overview?id=SonarSource_sonar-scanner-npm) [![Security](https://sonarcloud.io/api/project_badges/measure?project=SonarSource_sonar-scanner-npm&metric=security_rating)](https://sonarcloud.io/project/overview?id=SonarSource_sonar-scanner-npm) [![Releases](https://img.shields.io/github/release/SonarSource/sonar-scanner-npm.svg)](https://github.com/SonarSource/sonar-scanner-npm/releases)


## Installation

_Prerequisite: Node v14+ (otherwise use sonarqube-scanner v2.9.1)_

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
      'sonar.sources': 'src',
      'sonar.tests': 'test'
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

## Usage: run analyses with npx

To run analyses without explicitly installing the scanner, run the following command instead:

``` sh
npx sonarqube-scanner
```

Similar to the above, you can specify analysis properties and settings using either a `package.json` file, a `sonar-project.properties` file, or command line arguments.

## FAQ

#### *I constantly get "Impossible to download and extract binary [...] In such situation, the best solution is to install the standard SonarScanner", what can I do?*

You can install manually the [standard SonarScanner](https://redirect.sonarsource.com/doc/install-configure-scanner.html),
which requires to have a Java Runtime Environment available too (Java 8+).

It is important to make sure that the SonarScanner `$install_directory/bin` location is added to the system `$PATH` environment variable. This will ensure that `sonar-scanner` command will be resolved by the customScanner, and prevent the error:

``` javascript
Error: Local install of SonarScanner not found.
    at getLocalSonarScannerExecutable (<project_dir>/node_modules/sonarqube-scanner/src/sonar-scanner-executable.js:153:11)
    at scanUsingCustomScanner (<project_dir>/node_modules/sonarqube-scanner/src/index.js:52:3)
...
```

Once local installation is done, you can replace the 2nd line of the example:

```javascript
var scanner = require('sonarqube-scanner').customScanner;
```

### In my Docker container, the scanner fails with ".../jre/bin/java: not found", how do I solve this?

You are probably relying on Alpine for your Docker image, and Alpine does not include glibc by default.
It needs to be [installed manually](https://laptrinhx.com/docker-for-mac-alpine-glibc-issues-802275018).

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

## Download behind proxy

In order to be able to download binaries when you're behind a proxy it will be enough to set http_proxy environment variable.

**Example:**
```shell
export http_proxy=http://mycompanyproxy.com:PORT
```

**Behind authenticated proxy:**
```shell
export http_proxy=http://user:password@mycompanyproxy.com:PORT
```

## License

`sonarqube-scanner` is licensed under the [LGPL v3 License](http://www.gnu.org/licenses/lgpl.txt).
