#!/bin/bash
if [ -z "$1" ]
  then
    echo "No path supplied"
    exit 1
fi

AURA_FILEPATH=$1
COMPAT_FILEPATH=$2
npm run build:artifacts
# engine versions
cp  ./packages/lwc-engine/dist/umd/es2017/engine* $AURA_FILEPATH/aura-resources/src/main/resources/aura/resources/engine/
cp  ./packages/lwc-engine/dist/umd/es5/engine.js $AURA_FILEPATH/aura-resources/src/main/resources/aura/resources/engine/engine_compat.js
cp  ./packages/lwc-engine/dist/umd/es5/engine_debug.js $AURA_FILEPATH/aura-resources/src/main/resources/aura/resources/engine/engine_compat_debug.js
cp  ./packages/lwc-engine/dist/umd/es5/engine.min.js $AURA_FILEPATH/aura-resources/src/main/resources/aura/resources/engine/engine_compat.min.js

# compiler
cp  ./packages/lwc-compiler/dist/umd/compiler.js $AURA_FILEPATH/aura-modules/src/main/resources/modules/compiler.js

# compat-helpers
cd $COMPAT_FILEPATH
npm run build:bundle
cp  ./dist/* $AURA_FILEPATH/aura-resources/src/main/resources/aura/resources/compat-helpers/
