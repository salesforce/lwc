/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const replace = require('rollup-plugin-replace');
const { rollup } = require('rollup');
const { version } = require('../package.json');

async function updateVersion(version) {
    const sourcePath = path.resolve('dist/commonjs/index.js');

    const result = await rollup({
        input: sourcePath,
        plugins: [
            replace({
                __VERSION__: version,
            }),
        ],
    });

    await result.write({
        file: sourcePath,
        format: 'cjs',
        sourcemap: false, // keep typescript generated map to stay consistent with the rest of the files.
    });
}

if (!version || typeof version !== 'string') {
    throw new Error(
        'Failed to update compiler version. Expected version value as a string, received: ' +
            version
    );
}

updateVersion(version);
