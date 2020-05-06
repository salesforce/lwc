/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const typescript = require('typescript');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');

const { version } = require('../package.json');

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;
const formats = ['es', 'cjs'];

module.exports = {
    input: path.resolve(__dirname, '../src/main.ts'),
    external: ['@lwc/engine-core', '@lwc/shared'],

    output: formats.map((format) => {
        return {
            name: 'LwcDom',
            file: path.resolve(
                __dirname,
                `../dist/engine-server${format === 'cjs' ? '.cjs' : ''}.js`
            ),
            format,
            banner: banner,
            footer: footer,
        };
    }),

    plugins: [
        rollupTypescriptPlugin({
            target: 'es2017',
            typescript,
        }),
    ],

    onwarn({ code, message }) {
        if (code !== 'CIRCULAR_DEPENDENCY') {
            throw new Error(message);
        }
    },
};
