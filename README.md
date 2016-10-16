# NPM module to run SonarQube analyses

Example on how to use it with Gulp:

```javascript
var gulp = require('gulp');
var sonarqubeScanner = require('sonarqube-scanner');

gulp.task('default', function() {
  sonarqubeScanner({
    serverUrl : "http://localhost:9000",
    token : "019d1e2e04eefdcd0caee1468f39a45e69d33d3f",
    options : {}
  });
});
```

, with the following dependencies added to the `package.json` file:


```javascript
...
  "devDependencies": {
    "gulp": "^3.9.1",
    "sonarqube-scanner": "0.1.0"
  }
...
```
