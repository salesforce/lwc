#!/usr/bin/env bash
#
# Copyright (c) 2018, salesforce.com, inc.
# All rights reserved.
# SPDX-License-Identifier: MIT
# For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
#
# Create symlinks in the local node_modules directory to point to the root ones.
# This is bizarre, but it seems to be the only way to get Tachometer to recognize
# our local deps, e.g. when running in `this-patch` mode (not `tip-of-tree` mode).
# See: https://github.com/Polymer/tachometer/issues/215

set -e

mkdir -p ./node_modules/@lwc

for pkg in @lwc/engine-dom @lwc/engine-server @lwc/synthetic-shadow @lwc/perf-benchmarks-components; do
  if [ ! -L "./node_modules/$pkg" ]; then
    ln -s "../../../../../packages/$pkg" "./node_modules/$pkg"
  fi
done
