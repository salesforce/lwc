#!/usr/bin/env bash

# Do the full git/GitHub dance to publish a new release. Still requires some manual steps.
# Usage: yarn release <version> [branch=release]
# Example: yarn release 8.16.5 summer25

set -e

if ! which gh >/dev/null; then
  echo 'This script requires the GitHub CLI. Please install before continuing (`brew install gh` or https://cli.github.com/).'
  echo 'Alternatively, run the individual steps of this script manually (`yarn release:version` and `yarn release:publish`).'
  exit 1
fi

echo 'Creating version bump PR...'
./version.sh "$1"
echo 'Creating release PR...'
./publish.sh "$2"