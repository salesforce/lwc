#!/usr/bin/env node

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const execa = require('execa');
const isCI = require('is-ci');

const ARGS = [
    // https://github.com/lerna/lerna/tree/master/commands/publish
    'publish',
    // Explicitly publish packages tagged in the current commit
    'from-git',
    // Disable lifecycle scripts, specifically `prepare`
    '--ignore-scripts',
    // Lerna will otherwise attempt to verify npm user access
    '--no-verify-access',
    '--yes',
];

const { stderr, stdin, stdout } = process;

const RELEASE_BRANCH_RE = /^(master|((winter|spring|summer)\d+))$/;

try {
    if (!isCI) {
        console.error('This script is only meant to run in CI.');
        process.exit(1);
    }

    const currentBranch = execa.sync('git', ['branch', '--show-current'], { shell: true }).stdout;
    if (!RELEASE_BRANCH_RE.test(currentBranch)) {
        console.error('This script is only meant to run in a release branch.');
        process.exit(1);
    }

    ARGS.push('--dist-tag', currentBranch === 'master' ? 'next' : currentBranch);

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
