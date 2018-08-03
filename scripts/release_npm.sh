#!/bin/bash

# Normalize params
PACKAGE_VERSION="$1"
[ ! -z "$2" ] && [ "$2" != "null" ] && CANARY="--canary=beta" || CANARY="";

if [ -z "${PACKAGE_VERSION}" ]; then
        echo "You must specify a version to release"
        echo "Comand options: semver [--prerelease] (ex: 0.12.1 --prelease)"
        exit 1;
fi

# Get the current version
version=`lerna ls --scope lwc-engine`

if [[ $version = *"${PACKAGE_VERSION}"* ]]; then
  echo "Version already available, skipping release."
  exit 0;
fi

# Command to push the packages
CMD_PREPARE="yarn prepare"
CMD_PUBLISH_PACKAGES="lerna publish --exact --force-publish=* --registry https://npm.lwcjs.org --yes --skip-git ${CANARY} --repo-version ${PACKAGE_VERSION} --npm-client npm"

# Run
echo $CMD_PREPARE;
$CMD_PREPARE;
echo $CMD_PUBLISH_PACKAGES;
$CMD_PUBLISH_PACKAGES;
