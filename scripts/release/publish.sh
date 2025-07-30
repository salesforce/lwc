#!/usr/bin/env bash

# Find the commit on master that last changed the root package.json version,
# then submit a PR to merge that commit onto the release branch and release via nucleus
# Optionally set WORK_ITEM env var to include in commit/PR title
# Usage: yarn release:publish [branch=release]
# Example: WORK_ITEM=W-1234567 yarn release:publish

set -e

BRANCH="release-publish-$(date -u +'%Y-%m-%d-%H_%M')"
BASE_BRANCH='master'
RELEASE_BRANCH="${1:-release}"

# Avoid accidentally committing unrelated files
if [[ -n $(git status --porcelain) ]]; then
  echo -e '\033[1mPlease stash your work before continuing.\n\033[0m'
  git status
  exit 1
fi

git switch "$BASE_BRANCH"
git pull
# The last commit that changed the root package.json version
# (in case new commits were merged onto the base branch since then that aren't ready for release)
VERSION_SHA=$(git blame -- package.json | grep '"version":' | cut -d' ' -f1)
VERSION=$(jq -r .version package.json)

# Create a new branch with the changes to release
git switch -c "$BRANCH" "$VERSION_SHA"
git push origin HEAD

if ! which gh >/dev/null; then
  # GitHub CLI not installed - clean up and prompt for manual branch creation
  git switch "$BASE_BRANCH"
  git branch -D "$BRANCH"
  echo "Open a PR: https://github.com/salesforce/lwc/pull/new/$BRANCH"
  exit 0
fi

PR_TITLE="chore: release $VERSION"
if [ -n "$WORK_ITEM" ]; then
  PR_TITLE+=" @$WORK_ITEM"
fi
# Use GitHub CLI to create a PR and wait for CI checks to pass
gh pr create -t "$PR_TITLE" -b '' -B "$RELEASE_BRANCH" -H "$BRANCH"
# Clean up locally
git switch "$BASE_BRANCH"
git branch -D "$BRANCH"

# Wait for CI to complete
sleep 3 # Give GitHub time to kick off CI
. "$(dirname "$0")/wait-for-pr.sh" "$BRANCH"
if ! gh pr checks --fail-fast --watch; then
  echo 'CI failed. Cannot continue with release.'
  gh pr view "$BRANCH" --web
  exit 1
fi

sleep 10 # Give nucleus time to start the release job
RELEASE_JOB=$(gh pr checks "$BRANCH" --json name,link -q '.[]|select(.name=="continuous-integration/nucleus/release").link')
echo "Nucleus release started: $RELEASE_JOB"

# Wait for GitHub release to be created by Nucleus, then open it
echo 'The GitHub release notes must be added manually. You can exit the script now and open GitHub on your own, or wait until the release is created and the script will open the page for you.'
sleep 300 # Nucleus job usually takes ~5 minutes
while ! gh release view "v$VERSION" >/dev/null; do
  sleep 15
done
gh release view "v$VERSION" --web
