/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const rollupReplacePlugin = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');

const { version } = require('../../package.json');
const { generateTargetName } = require('./util');

const input = path.resolve(__dirname, '../../src/index.ts');
const outputDir = path.resolve(__dirname, '../../dist/umd');

const banner = `/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`;
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target } = config;

    return {
        input,
        output: {
            file: path.join(outputDir + `/${target}`, generateTargetName(config)),
            name: 'ReactiveService',
            format,
            banner,
            footer,
        },
        plugins: [
            typescript({ target, typescript: require('typescript') }),
            rollupReplacePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }),
        ],
    };
}

module.exports = [
    rollupConfig({ format: 'umd', target: 'es5' }),
    rollupConfig({ format: 'umd', target: 'es2017' }),
];
