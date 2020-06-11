/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const path = require('path');
const typescript = require('typescript');

const nodeResolvePlugin = require('rollup-plugin-node-resolve');
const typescriptPlugin = require('rollup-plugin-typescript');

const { version } = require('../package.json');

const banner = `/* proxy-compat-disable */`;
const footer = `/* version: ${version} */`;
const formats = ['es', 'cjs'];

module.exports = {
    input: path.resolve(__dirname, '../src/index.ts'),

    output: formats.map((format) => {
        return {
            file: path.resolve(
                __dirname,
                '../dist',
                `engine-dom${format === 'cjs' ? '.cjs' : ''}.js`
            ),
            format,
            banner: banner,
            footer: footer,
        };
    }),

    plugins: [
        nodeResolvePlugin({ only: [/^@lwc\//] }),
        typescriptPlugin({
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
