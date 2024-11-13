#!/usr/bin/env bash

# CI fails for external contributors because they do not have access to the secrets necessary to run
# all jobs (namely, Sauce Labs). This script is a workaround to copy the branch from the external
# contributor's fork and push it to the main repo. This causes CI to be executed by the internal
# maintainer, and therefore have full access to all the secrets.
# WARNING: This is not safe! Review all code changes in the PR before granting access to secrets.
#
# Usage: yarn copy-fork <PR number> [remote=origin]

set -e

PR_INPUT="$1" # Technically can be any input `gh pr` accepts
REMOTE="${2:-origin}"

# Avoid accidentally committing unrelated files
if [[ -n `git status --porcelain` ]]; then
  echo -e '\033[1mPlease stash your work before continuing.\n\033[0m'
  git status
  exit 1
fi

# Enforce required tooling
if [[ -z `which gh` ]]; then
  echo 'Please install the GitHub CLI (gh): https://cli.github.com/'
  exit 1
fi
if [[ -z `which jq` ]]; then
  echo 'Please install jq: https://jqlang.github.io/jq'
  exit 1
fi

# Enforce required input
if [[ -z "$PR_INPUT" ]]; then
  echo 'Please provide a pull request number or branch name.'
  exit 1
fi

# Enforce valid remote
if ! git remote get-url "$REMOTE" 1>/dev/null; then
  LIST=`git remote`
  echo "Please specify a known remote: ${LIST//$'\n'/, }"
  exit 1
fi

# Query GitHub for PR data
PR_DATA=`gh pr view "$PR_INPUT" --json author,baseRefName,isCrossRepository,number,title`
AUTHOR=`echo $PR_DATA | jq -r .author.login`
BASE=`echo $PR_DATA | jq -r .baseRefName`
IS_FORK=`echo $PR_DATA | jq -r .isCrossRepository`
NUMBER=`echo $PR_DATA | jq -r .number`
TITLE=`echo $PR_DATA | jq -r .title`

# Sanity check: Is this the right PR?
if [[ "$IS_FORK" != 'true' ]]; then
  echo "PR #$NUMBER: $TITLE (by $AUTHOR) is not external. This script is not necessary."
  exit 1
fi

# Sanity check: did you review?
echo -e 'This will run CI \033[1mwith secrets\033[0m using your account!'
echo "You are about to clone PR #$NUMBER: $TITLE (by $AUTHOR)."
read -p 'Did you review the PR first? (y/N) ' CONFIRM
if [[ ! $CONFIRM =~ ^[yY] ]]; then
  echo "Go review it now!"
  sleep 1
  gh pr view "$NUMBER" --web
  exit 1
fi

# Copy and push the branch, then immediately delete it
INTERNAL_BRANCH="external-contributor-ci-workaround/pr-$NUMBER"
gh pr checkout "$NUMBER" --branch "$INTERNAL_BRANCH"
git push -u "$REMOTE" "$INTERNAL_BRANCH"
gh pr create \
  --base "$BASE" \
  --head "$INTERNAL_BRANCH" \
  --title "[DO NOT MERGE] Trigger CI for #$NUMBER: $TITLE" \
  --body "External contributors do not have access to CI secrets. This PR serves as a workaround to trigger CI with secrets for #$NUMBER."
git switch -
gh pr close "$INTERNAL_BRANCH" --delete-branch

# Trigger nucleus tests
gh pr comment "$NUMBER" -b '/nucleus test'

# Open the original PR in browser to validate that CI is running correctly
gh pr view --web "$NUMBER"
