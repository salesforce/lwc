/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const typescriptPlugin = require('@rollup/plugin-typescript');
const path = require('path');

const { ROLLUP_WATCH: watchMode } = process.env;

// Basic @rollup/plugin-typescript config that can be shared between packages
module.exports = function typescript() {
    return typescriptPlugin({
        target: 'es2017',
        tsconfig: path.join(process.cwd(), 'tsconfig.json'),
        noEmitOnError: !watchMode, // in watch mode, do not exit with an error if typechecking fails
        ...(watchMode && {
            incremental: true,
            outputToFilesystem: true,
        }),
    });
};
