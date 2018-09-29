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
CMD_PUBLISH_PACKAGES="lerna publish --repo-version ${PACKAGE_VERSION} --yes --exact --force-publish --no-git-tag-version --no-push --registry https://npm.lwcjs.org ${CANARY} --no-verify-access --no-verify-registry"

# Update package versions before preparing the dist files
echo $CMD_UPDATE_VERSION;
$CMD_UPDATE_VERSION;

echo $CMD_PREPARE;
$CMD_PREPARE;

# Publish the packages to npm. Note that lerna cleans the working tree after this as of 3.0.4:
# https://github.com/lerna/lerna/blob/3cbeeabcb443d9415bb86c4539652b85cd7b4025/commands/publish/index.js#L354-L363
echo $CMD_PUBLISH_PACKAGES;
$CMD_PUBLISH_PACKAGES;

# Update package version again for later commit during the "commit release" stage
echo $CMD_UPDATE_VERSION;
$CMD_UPDATE_VERSION;
