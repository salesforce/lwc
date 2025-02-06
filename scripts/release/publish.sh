#!/usr/bin/env bash

# Find the commit on master that last changed the root package.json version,
# then submit a PR to merge that commit onto the release branch and release via nucleus
# Usage: yarn release:publish

set -e

BRANCH="release-publish-$(date -u +'%Y-%m-%d-%H_%M')"
BASE_BRANCH='master'

if [ -z "$VERSION" ]; then
  echo 'Specify a new version.'
  exit 1
fi

# Avoid accidentally committing unrelated files
if [[ -n `git status --porcelain` ]]; then
  echo -e '\033[1mPlease stash your work before continuing.\n\033[0m'
  git status
  exit 1
fi

exit 123
git switch "$BASE_BRANCH"
git pull
# The last commit that changed the root package.json version
VERSION_SHA=$(git blame -- package.json | grep '"version"' | cut -d' ' -f1)

# Create a new branch with the changes to release
git switch -c "$BRANCH" "$(gh pr view --json mergeCommit -q .mergeCommit.oid)"
git push origin HEAD

if which gh 2>/dev/null 1>/dev/null; then
  # Use GitHub CLI to create a PR and wait for it to be merged before exiting
  gh pr create -t "chore: release $VERSION"
  gh pr checks --fail-fast --watch
  gh pr comment -b "/nucleus release"
else
  # Clean up and prompt for manual branch creation
  git switch "$BASE_BRANCH"
  git branch -D "$BRANCH"
  echo "Open a PR: https://github.com/salesforce/lwc/pull/new/$BRANCH"
fi
