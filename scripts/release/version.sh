#!/usr/bin/env bash

# Bump package versions for release and submit a PR on GitHub
# Usage: yarn release:version <version>

set -e

VERSION="$1"
BRANCH="release-version-$(date -u +'%Y-%m-%d-%H_%M')"
BASE_BRANCH='master'

if [ -z "$VERSION" ]; then
  echo 'Specify a new version.'
  exit 1
fi

# Avoid accidentally committing unrelated files
if [[ -n $(git status --porcelain) ]]; then
  echo -e '\033[1mPlease stash your work before continuing.\n\033[0m'
  git status
  exit 1
fi

git switch "$BASE_BRANCH"
git pull
git switch -c "$BRANCH"
node "$(dirname "$0")/version.js" "$VERSION"
# Input could have been major/minor/patch; update the var to the resolved version
VERSION=$(jq -r .version package.json)
VERSION_BUMP_MESSAGE="chore: bump version to $VERSION"
git commit -am "$VERSION_BUMP_MESSAGE"
git push origin HEAD

if which gh 2>/dev/null 1>/dev/null; then
  # Use GitHub CLI to create a PR and wait for it to be merged before exiting
  gh pr create -t "$VERSION_BUMP_MESSAGE" -b ''
  gh pr merge --auto --squash --delete-branch
  git switch "$BASE_BRANCH" # Change branch now so --delete-branch works locally
  gh pr checks --fail-fast --watch "$BRANCH"
else
  # Clean up and prompt for manual branch creation
  git switch "$BASE_BRANCH"
  git branch -D "$BRANCH"
  echo "Open a PR: https://github.com/salesforce/lwc/pull/new/$BRANCH"
fi
