#!/bin/bash

PACKAGE_VERSION="$1";
CANARY="$2";

if [ -z "${PACKAGE_VERSION}" ]; then
        echo "You must specify a version to create the changelog"
        exit 1;
fi

if [ -n "${CANARY}" ]; then
    echo "Prerelease version, no changelog needed"
    exit 0;
fi

if git rev-parse $PACKAGE_VERSION >/dev/null 2>&1
then
    echo "Release already exists, skipping changelog"
    exit 0;
else
    yarn changelog:generate
fi
