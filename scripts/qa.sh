#!/bin/bash

set -euo pipefail

VERSION=$(grep version package.json | head -1  | awk -F: '{ print $2 }' | sed 's/[", ]//g')

source cirrus-env QA

# TODO: https://sonarsource.atlassian.net/browse/BUILD-2397
# We should have a virtual repo that include npmjs and sonarsource-npm-public-qa
# and an other one that include npmjs and sonarsource-npm-public-builds
# The repo npm is wrongly configured and should only include npmjs and sonarsource-npm-public-releases
npm config set registry https://repox.jfrog.io/artifactory/api/npm/npmjs/

cd test/integration
npm install
npm install --no-save "https://$ARTIFACTORY_PRIVATE_USERNAME:$ARTIFACTORY_PRIVATE_PASSWORD@repox.jfrog.io/artifactory/sonarsource-npm-public-qa/sonarqube-scanner/-/sonarqube-scanner-$VERSION-$BUILD_NUMBER.tgz"
