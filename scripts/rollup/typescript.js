/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const typescriptPlugin = require('@rollup/plugin-typescript');
const path = require('path');

// Basic @rollup/plugin-typescript config that can be shared between packages
module.exports = function typescript() {
    return typescriptPlugin({
        target: 'es2017',
        tsconfig: path.join(process.cwd(), 'tsconfig.json'),
        noEmitOnError: true,
        ...(process.env.ROLLUP_WATCH && {
            incremental: true,
            outputToFilesystem: true,
        }),
    });
};
