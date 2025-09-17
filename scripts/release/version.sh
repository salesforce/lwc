#!/usr/bin/env bash

# Bump package versions for release and submit a PR on GitHub
# Optionally set WORK_ITEM env var to include in commit/PR title
# Usage: yarn release:version <version>
# Example: WORK_ITEM=W-1234567 yarn release:version patch

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
if [ -n "$WORK_ITEM" ]; then
  VERSION_BUMP_MESSAGE+=" @$WORK_ITEM"
fi
git commit -am "$VERSION_BUMP_MESSAGE"
git push origin HEAD

if ! gh >/dev/null; then
  # No GitHub CLI, gotta do it manually
  git switch "$BASE_BRANCH"
  echo "Open a PR: https://github.com/salesforce/lwc/pull/new/$BRANCH"
  exit 0
fi

# Use GitHub CLI to create a PR and wait for it to be merged before exiting
gh pr create -t "$VERSION_BUMP_MESSAGE" -b ''
gh pr merge --auto --squash --delete-branch
git switch "$BASE_BRANCH"
git branch -D "$BRANCH"

sleep 3 # Give GitHub time to start CI before we check it
. "$(dirname "$0")/wait-for-pr.sh" "$BRANCH"
while [ "$(gh pr view "$BRANCH" --json state -q .state)" != 'MERGED' ]; do
  sleep 3 # Wait for GitHub to auto-merge the PR
done
