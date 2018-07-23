#!/bin/bash

# Normalize params
[ ! -z "$1" ] && PACKAGE_VERSION="$1" || PACKAGE_VERSION=$NPM_PACKAGE_VERSION;
[ ! -z "$2" ] && [ "$2" != "null" ] && CANARY="--canary=beta" || CANARY="";

if [ -f $PACKAGE_VERSION ]; then
        echo "You must specify a version to create the changelog"
        exit 1;
fi

if [ ! -z $CANARY ]; then
    echo "Prerelease version, no changelog needed"
    exit 0;
fi

if git rev-parse $PACKAGE_VERSION >/dev/null 2>&1
then
    echo "Release already exists, skipping changelog"
else
    yarn changelog:generate
fi
