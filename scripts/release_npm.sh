#!/bin/bash

# Normalize params
[ ! -z "$1" ] && PACKAGE_VERSION="$1" || PACKAGE_VERSION=$NPM_PACKAGE_VERSION;
[ ! -z "$2" ] && CANARY="--canary=beta" || CANARY="";

if [ -f $PACKAGE_VERSION ]; then
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
CMD_PUBLISH_PACKAGES="lerna publish --exact --force-publish=* --registry='https://npm.lwcjs.org' --skip-git --yes ${CANARY} --repo-version ${PACKAGE_VERSION} --new-version ${PACKAGE_VERSION} --non-interactive"

# Run
$CMD_PREPARE && $CMD_PUBLISH_PACKAGES;
