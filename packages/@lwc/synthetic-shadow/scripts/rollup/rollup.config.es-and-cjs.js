/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const typescript = require('typescript');
const path = require('path');
const rollupTypescript = require('rollup-plugin-typescript');
const rollupCleanup = require('rollup-plugin-cleanup');
const { version } = require('../../package.json');
const { generateTargetName } = require('./util');

const entry = path.resolve(__dirname, '../../src/index.ts');
const commonJSDirectory = path.resolve(__dirname, '../../dist/commonjs');
const modulesDirectory = path.resolve(__dirname, '../../dist/modules');

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;

function wrapModule() {
    return {
        renderChunk(code) {
            return `${banner}\nexport default function enableSyntheticShadow() {\n${code}\n}`;
        },
    };
}

function rollupConfig(config) {
    const { format, target, wrap } = config;
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
        plugins: [
            wrap && wrapModule(),
            rollupTypescript({ target, typescript }),
            rollupCleanup({ comments: 'none', extensions: ['js', 'ts'], sourcemap: false }),
        ].filter(Boolean),
    };
}

module.exports = [
    // Wrap encloses de module into a function so it can be conditionally enabled at runtime
    // This is very useful for testing.
    rollupConfig({ format: 'es', target: 'es2017', wrap: true }),

    rollupConfig({ format: 'es', target: 'es2017' }),
    rollupConfig({ format: 'cjs', target: 'es2017' }),
    rollupConfig({ format: 'cjs', target: 'es5' }),
];
