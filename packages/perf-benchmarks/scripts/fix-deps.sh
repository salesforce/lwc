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

rm -fr ./node_modules/@lwc/engine-dom \
  ./node_modules/@lwc/engine-server \
  ./node_modules/@lwc/synthetic-shadow \
  ./node_modules/perf-benchmarks-components

ln -sf ../../../../packages/@lwc/engine-dom ./node_modules/@lwc/engine-dom
ln -sf ../../../../packages/@lwc/engine-server ./node_modules/@lwc/engine-server
ln -sf ../../../../packages/@lwc/synthetic-shadow ./node_modules/@lwc/synthetic-shadow
ln -sf ../../../packages/perf-benchmarks-components ./node_modules/perf-benchmarks-components
