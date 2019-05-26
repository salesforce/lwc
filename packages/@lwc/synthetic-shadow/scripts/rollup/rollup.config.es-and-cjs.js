/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const typescript = require('typescript');
const path = require('path');
const rollupTypescript = require('rollup-plugin-typescript');
const { version } = require('../../package.json');
const { generateTargetName } = require('./util');

const entry = path.resolve(__dirname, '../../src/index.ts');
const commonJSDirectory = path.resolve(__dirname, '../../dist/commonjs');
const modulesDirectory = path.resolve(__dirname, '../../dist/modules');

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target } = config;

    const targetName = generateTargetName(config);
    const targetDirectory = (format === 'es' ? modulesDirectory : commonJSDirectory) + `/${target}`;

    return {
        input: entry,
        output: {
            file: path.join(targetDirectory, targetName),
            name: 'SyntheticShadow',
            format,
            banner,
            footer,
        },
        plugins: [rollupTypescript({ target, typescript })],
    };
}

module.exports = [
    rollupConfig({ format: 'es', target: 'es2017', test: true }),
    rollupConfig({ format: 'es', target: 'es2017' }),
    rollupConfig({ format: 'cjs', target: 'es2017' }),
    rollupConfig({ format: 'cjs', target: 'es5' }),
];
