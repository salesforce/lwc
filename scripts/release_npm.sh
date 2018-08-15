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
CMD_UPDATE_VERSION="lerna version ${PACKAGE_VERSION} --yes --exact --force-publish --no-git-tag-version --no-push"
CMD_PREPARE="yarn prepare"
CMD_PUBLISH_PACKAGES="lerna publish --repo-version ${PACKAGE_VERSION} --yes --exact --force-publish --no-git-tag-version --no-push --registry https://npm.lwcjs.org ${CANARY} --npm-client npm --no-verify-access --no-verify-registry"

# Run
echo $CMD_UPDATE_VERSION;
$CMD_UPDATE_VERSION;
echo $CMD_PREPARE;
$CMD_PREPARE;
echo $CMD_PUBLISH_PACKAGES;
$CMD_PUBLISH_PACKAGES;
