/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const typescript = require('@rollup/plugin-typescript');

const { version } = require('../../package.json');
const entry = path.resolve(__dirname, '../../src/index.ts');
const targetDirectory = path.resolve(__dirname, '../../dist');
const banner = `/**\n * Copyright (C) 2018 salesforce.com, inc.\n */`;
const footer = `/** version: ${version} */`;

function generateTargetName({ format }) {
    return ['index', format === 'cjs' ? '.cjs' : '', '.js'].join('');
}

function rollupConfig({ format }) {
    return {
        input: entry,
        output: {
            file: path.join(targetDirectory, generateTargetName({ format })),
            format,
            banner,
            footer,
        },
        plugins: [
            typescript({
                target: 'es2017',
                typescript: require('typescript'),
                tsconfig: path.join(__dirname, '../../tsconfig.json'),
            }),
        ],
    };
}

module.exports = [rollupConfig({ format: 'es' }), rollupConfig({ format: 'cjs' })];
