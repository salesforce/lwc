/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const typescript = require('typescript');
const rollupReplace = require('rollup-plugin-replace');
const { terser: rollupTerser } = require('rollup-plugin-terser');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');

const { version } = require('../../package.json');
const { generateTargetName } = require('./util');

const input = path.resolve(__dirname, '../../src/index.ts');
const outputDir = path.resolve(__dirname, '../../dist/umd');

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target, prod } = config;

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
            rollupTypescriptPlugin({ target, typescript }),
            rollupReplace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
            prod && rollupTerser(),
        ],
    };
}

module.exports = [
    // PROD
    rollupConfig({ format: 'umd', prod: true, target: 'es5' }),
    rollupConfig({ format: 'umd', prod: true, target: 'es2017' }),

    // PRODDEBUG mode
    rollupConfig({ format: 'umd', proddebug: true, target: 'es2017' }),
    rollupConfig({ format: 'umd', proddebug: true, target: 'es5' }),
];
