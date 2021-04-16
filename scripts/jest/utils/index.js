/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');
const { default: diff } = require('jest-diff');

function toMatchFile(receivedContent, filename) {
    const { snapshotState, expand } = this;

    const fileExists = fs.existsSync(filename);

    if (fileExists) {
        const actualContent = fs.readFileSync(filename, 'utf-8');

        if (receivedContent === null || receivedContent === undefined) {
            // If the file exists but the expected content is undefined or null. If the Jest is
            // running with the update snapshot flag the file should be deleted. Otherwise fails
            // the assertion stating that the file is not expected to be there.
            if (snapshotState._updateSnapshot === 'all') {
                fs.unlinkSync(filename);

                snapshotState.updated++;
                return { pass: true, message: () => {} };
            } else {
                snapshotState.unmatched++;
                return { pass: false, message: () => `TODO` };
            }
        }

        if (actualContent === receivedContent) {
            // If the expected file exists and the expected content is matching with the actual
            // content everything is fine.
            return { pass: true, message: () => {} };
        } else {
            // If the expected file is present but the content is not matching. if Jest is running
            // with the update snapshot flag override the expected content. Otherwise fails the
            // assertion with a diff.
            if (snapshotState._updateSnapshot === 'all') {
                fs.writeFileSync(filename, receivedContent);

                snapshotState.updated++;
                return { pass: true, message: () => {} };
            } else {
                const diffString = diff(actualContent, receivedContent, {
                    expand,
                });

                snapshotState.unmatched++;
                return {
                    pass: false,
                    message: () =>
                        `Received content doesn't match expected content for ${filename}.\n\n${diffString}`,
                };
            }
        }
    } else {
        if (receivedContent === null || receivedContent === undefined) {
            // If expected file doesn't exists and received content is null or undefined everything
            // is fine.
            return { pass: true, message: () => {} };
        }

        // If expected file doesn't exists but got a received content and if the snapshots
        // should be updated, create the new snapshot. Otherwise fails the assertion.
        if (snapshotState._updateSnapshot === 'new' || snapshotState._updateSnapshot === 'all') {
            fs.writeFileSync(filename, receivedContent);

            snapshotState.added++;
            return { pass: true, message: () => '' };
        } else if (snapshotState._updateSnapshot === 'none') {
            snapshotState.unmatched++;
            return { pass: false, message: () => 'TODO' };
        } else {
            snapshotState.unmatched++;
            return { pass: false, message: () => 'TODO' };
        }
    }
}

function testFixtureDir(config, testFn) {
    if (typeof config !== 'object' || config === null) {
        throw new TypeError(`Expected first argument to be an object`);
    }

    if (typeof testFn !== 'function') {
        throw new TypeError(`Expected second argument to be a function`);
    }

    const { pattern, root } = config;
    if (!pattern || !root) {
        throw new TypeError(`Expected a "root" and a "pattern" config to be specified`);
    }

    const matches = glob.sync(pattern, {
        cwd: root,
        absolute: true,
    });

    for (const filename of matches) {
        const src = fs.readFileSync(filename, 'utf-8');
        const dirname = path.dirname(filename);

        const fixtureName = path.relative(root, filename);

        test(fixtureName, () => {
            const outputs = testFn({
                src,
                filename,
                dirname,
            });

            for (const [outputName, content] of Object.entries(outputs)) {
                const outputPath = path.resolve(dirname, outputName);
                expect(content).toMatchFile(outputPath);
            }
        });
    }
}

// Register jest matcher.
expect.extend({ toMatchFile });

// Exports helper function for consumption in tests.
module.exports = {
    testFixtureDir,
};
