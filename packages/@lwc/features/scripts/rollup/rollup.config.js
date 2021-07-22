/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');

const writeDistAndTypes = require('../../../../../scripts/rollup/writeDistAndTypes');
const { version, dependencies, peerDependencies } = require('../../package.json');
const entry = path.resolve(__dirname, '../../src/flags.ts');
const banner = `/**\n * Copyright (C) 2018 salesforce.com, inc.\n */`;
const footer = `/** version: ${version} */`;

function generateTargetName({ format }) {
    return ['flags', format === 'cjs' ? '.cjs' : '', '.js'].join('');
}

function rollupConfig({ format }) {
    return {
        input: entry,
        output: {
            file: generateTargetName({ format }),
            format,
            banner,
            footer,
        },
        plugins: [
            nodeResolve({
                resolveOnly: [/^@lwc\//],
            }),
            typescript({
                target: 'es2017',
                tsconfig: path.join(__dirname, '../../tsconfig.json'),
            }),
            writeDistAndTypes(),
        ],
        external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
    };
}

module.exports = [rollupConfig({ format: 'es' }), rollupConfig({ format: 'cjs' })];
