#!/usr/bin/env bash
# Retry a script multiple times before failing. Used for CI.

set -e
set -x

export PATH="${PATH}:./node_modules/.bin"

MAX_RETRY=3
n=0
until [ $n -ge $MAX_RETRY ]
do
  echo "Try $[$n+1]/$MAX_RETRY..."
  "$@" && break
  n=$[$n+1]
done
if [ $n -ge $MAX_RETRY ]; then
  echo "Failed: ${@}" >&2
  exit 1
fi
