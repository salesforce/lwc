#!/usr/bin/env/bash

# Waits until a PR is ready to be merged
# Usage: ./wait-for-pr.sh <branch name or PR number>
# Example: ./wait-for-pr.sh 'my-branch-with-cool-changes'

set -e

BRANCH="$1"
if [ -z "$BRANCH" ]; then
  echo 'Please specify a branch name or PR number.'
  exit 1
fi

# Wait for CI to complete
if ! gh pr checks --fail-fast --watch; then
  echo 'CI failed. Cannot continue with release.'
  gh pr view "$BRANCH" --web
  exit 1
fi

# Also wait for approvals, if needed
if [ "$(gh pr view "$BRANCH" --json reviewDecision -q .reviewDecision)" != 'APPROVED' ]; then
  echo 'Waiting for PR approval.'
  while [ "$(gh pr view "$BRANCH" --json reviewDecision --jq .reviewDecision)" != 'APPROVED' ]; do
    sleep 30
  done
  echo 'PR approved! Continuing...'
fi
