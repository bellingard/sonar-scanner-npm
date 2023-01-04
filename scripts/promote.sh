#!/bin/bash

set -euo pipefail

PROJECT=sonar-scanner-npm
source cirrus-env PROMOTE

#configure jfrog cli to be able to promote build
jfrog config add repox --url $ARTIFACTORY_URL --access-token $ARTIFACTORY_PROMOTE_ACCESS_TOKEN
#promote from QA to public builds
jfrog rt bpr --status it-passed $PROJECT $BUILD_NUMBER sonarsource-npm-public-builds
