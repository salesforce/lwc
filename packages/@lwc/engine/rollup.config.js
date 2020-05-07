/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const path = require('path');
const typescript = require('typescript');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');
const nodeResolve = require('rollup-plugin-node-resolve');

const babel = require('@babel/core');
const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');

const { version } = require('./package.json');

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;
const formats = ['es', 'cjs'];

function rollupFeaturesPlugin() {
    return {
        name: 'rollup-plugin-lwc-features',
        transform(source) {
            return babel.transform(source, {
                plugins: [babelFeaturesPlugin],
            }).code;
        },
    };
}

module.exports = {
    input: path.resolve(__dirname, 'dom/src/index.ts'),

    output: formats.map((format) => {
        return {
            name: 'LwcDom',
            file: path.resolve(__dirname, `dist/engine${format === 'cjs' ? '.cjs' : ''}.js`),
            format,
            banner: banner,
            footer: footer,
        };
    }),

    plugins: [
        nodeResolve({ only: [/^@lwc\//, 'observable-membrane'] }),
        rollupTypescriptPlugin({
            target: 'es2017',
            typescript,
        }),
        rollupFeaturesPlugin(),
    ],

    onwarn({ code, message }) {
        if (code !== 'CIRCULAR_DEPENDENCY') {
            throw new Error(message);
        }
    },
};
