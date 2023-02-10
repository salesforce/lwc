/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescript = require('../../../../../scripts/rollup/typescript');
const { version } = require('../../package.json');

const entry = path.resolve(__dirname, '../../src/index.ts');
const targetDirectory = path.resolve(__dirname, '../../dist/');
const targetName = 'synthetic-shadow.js';
const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;

function wrapModule() {
    return {
        renderChunk(code) {
            return `${banner}\nexport default function enableSyntheticShadow() {\n${code}\n}`;
        },
    };
}

function rollupConfig({ wrap } = {}) {
    return {
        input: entry,
        output: {
            file: path.join(targetDirectory, targetName),
            name: 'SyntheticShadow',
            format: 'es',
            banner,
            footer,
        },
        plugins: [
            wrap && wrapModule(),
            nodeResolve({
                only: [/^@lwc\//],
            }),
            typescript(),
        ].filter(Boolean),
        onwarn({ code, message }) {
            if (!process.env.ROLLUP_WATCH && code !== 'CIRCULAR_DEPENDENCY') {
                throw new Error(message);
            }
        },
    };
}

module.exports = [
    // Wrap encloses de module into a function so it can be conditionally enabled at runtime
    // This is very useful for testing.
    //rollupConfig({ format: 'es', target: 'es2017', wrap: true }),

    rollupConfig(),
];
