/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');

/**
 * Small Rollup plugin that writes JavaScript files to `dist/` and TypeScript declaration files to
 * 'types/`. The reason for this is that `@rollup/plugin-typescript` doesn't make it possible to
 * write the two file types to two separate directories (without having `types` inside of `dist`).
 * See: https://github.com/rollup/plugins/blob/e32a9e9/packages/typescript/test/test.js#L52
 */
module.exports = function writeDistAndTypes() {
    return {
        id: 'write-dist-and-types',
        generateBundle(options, bundle) {
            for (const [id, descriptor] of Object.entries(bundle)) {
                const directory = id.endsWith('.d.ts') ? 'types' : 'dist';
                descriptor.fileName = path.join(directory, descriptor.fileName);
            }
            return null;
        },
    };
};
