#!/bin/bash

appVersion="$(node -e "console.log(require('./package.json').version)")"

docker build -t controlpointer-web:"${appVersion}" -f ./Dockerfile.web .
docker build -t controlpointer-api:"${appVersion}" -f ./Dockerfile.api .
