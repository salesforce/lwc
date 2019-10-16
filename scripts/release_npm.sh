#!/bin/bash

# Copyright (c) 2018, salesforce.com, inc.
# All rights reserved.
# SPDX-License-Identifier: MIT
# For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT

# Normalize params
PACKAGE_VERSION="$1"
TAG_NAME="$2"
# Optional registry param
REGISTRY="$3"

if [ -z "${PACKAGE_VERSION}" ]; then
  echo "You must specify a version to release"
  echo "Comand options: semver tagName (ex: 0.12.1 next)"
  exit 1;
fi

if [ -z "${TAG_NAME}" ]; then
  echo "You must specify a tagname"
  echo "Comand options: semver tagName (ex: 0.12.1 next)"
  exit 1;
fi

if [ -n "${REGISTRY}" ]; then
  REGISTRY="--registry ${REGISTRY}"
fi

TAG="--npm-tag $TAG_NAME"

# Get the current version
version=`lerna ls --json --scope @lwc/engine`

if [[ $version = *"${PACKAGE_VERSION}"* ]]; then
  echo "Version already available, skipping release."
  exit 0;
fi

# Command to push the packages
CMD_UPDATE_VERSION="lerna version ${PACKAGE_VERSION} --yes --exact --force-publish --no-git-tag-version --no-push"
CMD_PUBLISH_PACKAGES="lerna publish ${PACKAGE_VERSION} ${TAG} --yes --exact --force-publish --no-git-tag-version --no-push ${REGISTRY} --no-verify-access --no-verify-registry"

# Publish the packages to npm. Note that lerna cleans the working tree after this as of 3.0.4, so we need to reapply version
# https://github.com/lerna/lerna/blob/3cbeeabcb443d9415bb86c4539652b85cd7b4025/commands/publish/index.js#L354-L363
echo $CMD_PUBLISH_PACKAGES;
$CMD_PUBLISH_PACKAGES;

# Update package version again for later commit during the "commit release" stage
echo $CMD_UPDATE_VERSION;
$CMD_UPDATE_VERSION;
