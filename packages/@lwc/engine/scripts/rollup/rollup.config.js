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
const babel = require('@babel/core');
const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');

const { version } = require('../../package.json');
const entry = path.resolve(__dirname, '../../src/framework/main.ts');
const targetDirectory = path.resolve(__dirname, '../../dist/');

const banner = `/* proxy-compat-disable */`;
const footer = `/** version: ${version} */`;

function generateTargetName({ format }) {
    return ['engine', format === 'cjs' ? '.cjs' : '', '.js'].join('');
}

function ignoreCircularDependencies({ code, message }) {
    if (code !== 'CIRCULAR_DEPENDENCY') {
        throw new Error(message);
    }
}

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

const TS_WHITELIST = ['**/*.ts', '/**/node_modules/**/*.js', '*.ts', '/**/*.js'];

function rollupConfig({ format = 'es' } = {}) {
    return {
        input: entry,
        onwarn: ignoreCircularDependencies,
        output: {
            name: 'LWC',
            file: path.join(targetDirectory, generateTargetName({ format })),
            format,
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
            rollupFeaturesPlugin(),
        ],
    };
}

module.exports = [rollupConfig({ format: 'es' }), rollupConfig({ format: 'cjs' })];
