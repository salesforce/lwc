#!/bin/bash

# Copyright (c) 2018, salesforce.com, inc.
# All rights reserved.
# SPDX-License-Identifier: MIT
# For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT

if (( $# != 2 )); then
    echo "Illegal number of parameters"
    exit 1;
fi

LWC_VERSION="$1"
TAG_NAME="$2"

# Get the current tag
CURRENT_TAG=$(npm dist-tags ls @lwc/engine-core | sed -n "s/.*${TAG_NAME}: \(.*\)/\1/p")

if [[ ${CURRENT_TAG} = ${LWC_VERSION} ]]; then
  echo "LWC version ${LWC_VERSION} already tagged to ${TAG_NAME}"
  exit 0;
fi

CMD_UPDATE_TAGS="lerna exec --ignore perf-benchmarks --ignore integration-tests -- npm dist-tag add \$LERNA_PACKAGE_NAME@${LWC_VERSION} ${TAG_NAME}"

echo $CMD_UPDATE_TAGS
$CMD_UPDATE_TAGS
