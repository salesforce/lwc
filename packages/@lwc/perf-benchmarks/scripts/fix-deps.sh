#!/usr/bin/env bash
#
# Copyright (c) 2024, Salesforce, Inc.
# All rights reserved.
# SPDX-License-Identifier: MIT
# For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
#
# Create symlinks in the local node_modules directory to point to the root ones.
# This is a bit bizarre, but it's very tricky to get Tachometer to allow bare npm-style imports in
# a monorepo project. We could potentially get rid of this script by doing relative imports instead.
# See: https://github.com/google/tachometer/issues/215#issuecomment-2267194394

set -e

mkdir -p ./node_modules/@lwc

for pkg in @lwc/engine-dom @lwc/engine-server @lwc/perf-benchmarks-components @lwc/ssr-runtime @lwc/synthetic-shadow; do
  if [ ! -L "./node_modules/$pkg" ]; then
    ln -s "../../../../../packages/$pkg" "./node_modules/$pkg"
  fi
done
