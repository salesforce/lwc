#!/bin/bash

# Normalize params
[ ! -z "$1" ] && PACKAGE_VERSION="$1" || PACKAGE_VERSION=$NPM_PACKAGE_VERSION;
[ ! -z "$2" ] && [ "$2" != "null" ] && CANARY="--canary=beta" || CANARY="";

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

# Prepend "v" to tag to mimic logic in lerna and stay consistent with previous releases
GIT_TAG_VERSION="v${PACKAGE_VERSION}"

# Command to push the packages
CMD_PREPARE="yarn prepare"
CMD_GIT_TAG="git tag ${GIT_TAG_VERSION} -m ${GIT_TAG_VERSION}"
CMD_PUBLISH_PACKAGES="lerna publish --exact --force-publish=* --registry https://npm.lwcjs.org --yes --skip-git ${CANARY} --repo-version ${PACKAGE_VERSION} --npm-client npm"

# Run
echo $CMD_PREPARE
$CMD_PREPARE

echo $CMD_GIT_TAG
$CMD_GIT_TAG

echo $CMD_PUBLISH_PACKAGES
$CMD_PUBLISH_PACKAGES
