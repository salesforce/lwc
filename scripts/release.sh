#!/bin/bash

[ ! -z "$1" ] && PACKAGE_VERSION="$1" || PACKAGE_VERSION=$NPM_PACKAGE_VERSION;

if [ -f $PACKAGE_VERSION ]; then
        echo "You must specify a version to release"
        exit 1;
fi

CMD_PUBLISH_PACKAGES="lerna publish --exact --force-publish=* --registry='https://npm.lwcjs.org' --skip-git --yes --repo-version ${PACKAGE_VERSION}"
CMD_CHANGELOG="yarn changelog:generate"
CMD_PREPARE="yarn prepare"
CMD_GIT_ADD="git add CHANGELOG.md lerna.json packages/*"
CMD_GIT_COMMIT="git commit -m 'release: v${PACKAGE_VERSION}'"
CMD_GIT_PUSH="git push"

echo $PUBLISH_PACKAGES

if $CMD_PREPARE; then
    if [ -f $CMD_PACKAGE_VERSION ]; then
        if $CMD_PUBLISH_PACKAGES; then
            if $CMD_CHANGELOG; then
                $CMD_GIT_ADD && eval $CMD_GIT_COMMIT && $CMP_GIT_PUSH && echo "RELEASED ${PACKAGE_VERSION}"
            fi
        fi
    fi
fi
