#!/bin/bash
if [ -z "$1" ]
  then
    echo "No path supplied"
    exit 1
fi

FILEPATH=$1
npm run build:artifacts
# engine versions
cp  ./dist/engine* $FILEPATH/aura-resources/src/main/resources/aura/resources/engine/
# compat-helpers
cp  ./dist/compat-helpers* $FILEPATH/aura-resources/src/main/resources/aura/resources/compat-helpers/
# compiler
cp  ./dist/compiler.min.js $FILEPATH/aura-modules/src/main/resources/modules/compiler.min.js
