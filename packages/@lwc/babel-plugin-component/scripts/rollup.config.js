/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const path = require('node:path');
const typescript = require('../../../../scripts/rollup/typescript');
const writeDistAndTypes = require('../../../../scripts/rollup/writeDistAndTypes');
const { version, dependencies, peerDependencies } = require('../package.json');
const banner = `/**\n * Copyright (C) 2023 salesforce.com, inc.\n */`;
const footer = `/** version: ${version} */`;

const formats = ['es', 'cjs'];

module.exports = {
    input: path.resolve(__dirname, '../src/index.ts'),

    output: formats.map((format) => {
        return {
            file: `index${format === 'cjs' ? '.cjs' : ''}.js`,
            sourcemap: true,
            format,
            banner,
            footer,
        };
    }),

    plugins: [typescript(), writeDistAndTypes()],

    onwarn({ code, message }) {
        if (!process.env.ROLLUP_WATCH && code !== 'CIRCULAR_DEPENDENCY') {
            throw new Error(message);
        }
    },

    external: [
        ...Object.keys(dependencies || {}),
        ...Object.keys(peerDependencies || {}),
        'node:path',
    ],
};
