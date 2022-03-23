/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const rollup = require('rollup');

function rollupWatch({ inputOptions, outputOptions }) {
    const rootDir = path.resolve(__dirname, '../..');
    const input = inputOptions.input;
    const relativeId = path.relative(rootDir, outputOptions.file);

    const watcher = rollup.watch({
        ...inputOptions,
        output: outputOptions,
        watch: {
            clearScreen: false,
        },
    });

    // This is largely borrowed from Rollup's --watch cli implementation:
    // https://github.com/rollup/rollup/blob/b8315e03f9790d610a413316fbf6d565f9340cab/cli/run/watch-cli.ts#L83-L135
    watcher.on('event', (event) => {
        switch (event.code) {
            case 'BUNDLE_START':
                console.error(`bundles ${input} → ${relativeId}...`);
                break;

            case 'BUNDLE_END':
                console.error(`created ${relativeId} in ${event.duration}ms`);
                break;
        }

        if (event.result) {
            event.result.close().catch((err) => {
                console.error(err);
            });
        }
    });
}

module.exports = {
    rollupWatch,
};
