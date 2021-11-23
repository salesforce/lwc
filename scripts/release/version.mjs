#!/usr/bin/env node

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { execaSync } from 'execa';

const ARGS = [
    // https://github.com/lerna/lerna/tree/master/commands/version
    'version',
    // Use exact version number without using semver notation (i.e., ~ and ^)
    '--exact',
    // Skip lerna change detection and force version number updates across all packages
    '--force-publish',
    // Skip git commit and tag push
    '--no-push',
    // Don't add a git tag
    '--no-git-tag-version',
];

const { stderr, stdin, stdout } = process;

try {
    execaSync('lerna', ARGS, {
        // Prioritize locally installed binaries (node_modules/.bin)
        preferLocal: true,
        stderr,
        stdin,
        stdout,
    });
} catch (ex) {
    console.error(ex);
    process.exit(1);
}
