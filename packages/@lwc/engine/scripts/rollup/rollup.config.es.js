/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const typescript = require('typescript');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');
const nodeResolve = require('rollup-plugin-node-resolve');

const { TS_WHITELIST, ignoreCircularDependencies } = require('./utils');
const { version } = require('../../package.json');

const entry = path.resolve(__dirname, '../../src/framework/main.ts');
const targetDirectory = path.resolve(__dirname, '../../dist/');
const targetName = 'engine.js';

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;

function rollupConfig() {
    return {
        input: entry,
        onwarn: ignoreCircularDependencies,
        output: {
            name: 'LWC',
            file: path.join(targetDirectory, targetName),
            format: 'es',
            banner: banner,
            footer: footer,
        },
        plugins: [
            nodeResolve(),
            rollupTypescriptPlugin({
                target: 'es2017',
                typescript,
                include: TS_WHITELIST,
            }),
        ],
    };
}

module.exports = [rollupConfig()];
