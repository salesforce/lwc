#!/usr/bin/env node

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const execa = require('execa');

let ARGS = [
    // https://github.com/lerna/lerna/tree/master/commands/version
    'version',
    // Use exact version number without using semver notation (i.e., ~ and ^)
    '--exact',
    // Update version number even if there were no changes in the package
    '--force-publish',
    // Avoid pushing by default, this flag is removed if `--push` is specified
    '--no-push',
];

// Only push to origin if the `--push` argument is specified
if (process.argv.includes('--push')) {
    ARGS = ARGS.filter((value) => value !== '--no-push');
}

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
    console.log(ex);
}
