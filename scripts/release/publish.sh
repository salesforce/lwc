#!/usr/bin/env bash

# Find the commit on master that last changed the root package.json version,
# then submit a PR to merge that commit onto the release branch and release via nucleus
# Usage: yarn release:publish [branch=release]

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
VERSION_SHA=$(git blame -- package.json | grep '"version"' | cut -d' ' -f1)
VERSION=$(jq -r .version package.json)

# Create a new branch with the changes to release
git switch -c "$BRANCH" "$VERSION_SHA"
git push origin HEAD

if which gh 2>/dev/null 1>/dev/null; then
  # Use GitHub CLI to create a PR and wait for CI checks to pass
  gh pr create -t "chore: release $VERSION" -B "$RELEASE_BRANCH" -b ''
  gh pr checks --fail-fast --watch

  # Usage: wait_until state CLOSED 10
  function wait_until() {
    while [ "$(gh pr view "$BRANCH" --json "$1" --jq ".$1")" != "$2" ]; do
      sleep "$3"
    done
  }

  # Also wait for approvals, if needed
  if [ "$(gh pr view "$BRANCH" --json reviewDecision -q .reviewDecision)" != 'APPROVED' ]; then
    echo 'Release cannot continue without approval.'
    wait_until reviewDecision APPROVED 30
  fi

  # Do the release!
  gh pr comment -b "/nucleus release"
  sleep 60 # Nucleus release always takes at least a minute
  wait_until state CLOSED 10
  LATEST=$([[ "$RELEASE_BRANCH" == release ]] && echo '--latest' || echo '')
  gh release create "v$VERSION" --generate-notes "$LATEST"

  # Cleanup
  git switch "$BASE_BRANCH"
  git branch -D "$BRANCH"
else
  # Clean up and prompt for manual branch creation
  git switch "$BASE_BRANCH"
  git branch -D "$BRANCH"
  echo "Open a PR: https://github.com/salesforce/lwc/pull/new/$BRANCH"
fi
