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

const RELEASE_BRANCH_RE = /(master|((winter|spring|summer)\d+))/;

try {
    if (!isCI) {
        console.error('This script is only meant to run in CI.');
        process.exit(1);
    }

    // We can't use a straightforward git command like `git branch --show-current` because we've
    // checked out a git tag and we're in a detached HEAD state. The following logic attempts to
    // verify that this tag points to a commit contained by a release branch.

    // All branches that contain the current commit. Since we only deal with release commits, the
    // only scenario where this might be an issue is if we try to publish a release commit from
    // master after CLCO because the commit will show up in two branches.
    const branches = execa.commandSync('git branch --all --contains').stdout;

    console.log('DEBUG', branches);

    const result = RELEASE_BRANCH_RE.exec(branches);
    if (result === null) {
        const tag = execa.commandSync('git tag --points-at HEAD').stdout;
        console.error(`The commit referenced by "${tag}" is not contained by any release branch.`);
        process.exit(1);
    }

    const [, releaseBranch] = result;
    const distTag = releaseBranch === 'master' ? 'next' : releaseBranch;
    ARGS.push('--dist-tag', distTag);

    console.log(
        `Attempting to release from branch "${releaseBranch}" using dist-tag "${distTag}".`
    );

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
