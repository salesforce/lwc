#!/usr/bin/env node

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const execa = require('execa');

const ARGS = [
    // https://github.com/lerna/lerna/tree/master/commands/version
    'version',
    // Use exact version number without using semver notation (i.e., ~ and ^)
    '--exact',
    // Update version number even if there were no changes in the package
    '--force-publish',
    '--no-push',
];

const { stderr, stdin, stdout } = process;

try {
    execa.sync('lerna', ARGS, {
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
