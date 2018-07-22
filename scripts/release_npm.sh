#!/bin/bash

# Get the package version
[ ! -z "$1" ] && PACKAGE_VERSION="$1" || PACKAGE_VERSION=$NPM_PACKAGE_VERSION;

if [ -f $PACKAGE_VERSION ]; then
        echo "You must specify a version to release"
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
CMD_PUBLISH_PACKAGES="lerna publish --exact --force-publish=* --registry='https://npm.lwcjs.org' --skip-git --yes --repo-version ${PACKAGE_VERSION}"

# Run
$CMD_PREPARE && $CMD_PUBLISH_PACKAGES;
