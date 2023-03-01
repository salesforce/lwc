/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('../../../../../scripts/rollup/typescript');
const writeDistAndTypes = require('../../../../../scripts/rollup/writeDistAndTypes');
const { version } = require('../../package.json');
const entry = path.resolve(__dirname, '../../src/index.ts');
const banner = `/**\n * Copyright (C) 2018 salesforce.com, inc.\n */`;
const footer = `/** version: ${version} */`;

function generateTargetName({ format }) {
    return ['wire-service', format === 'cjs' ? '.cjs' : '', '.js'].join('');
}

function rollupConfig({ format }) {
    return {
        input: entry,
        output: {
            file: generateTargetName({ format }),
            sourcemap: true,
            name: 'WireService',
            format,
            banner,
            footer,
        },
        plugins: [
            nodeResolve({
                only: [/^@lwc\//],
            }),
            typescript(),
            writeDistAndTypes(),
        ],
    };
}

module.exports = [rollupConfig({ format: 'es' }), rollupConfig({ format: 'cjs' })];
