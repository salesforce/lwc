/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const path = require('path');
const babel = require('@babel/core');
const typescriptPlugin = require('rollup-plugin-typescript');
const { default: nodeResolvePlugin } = require('@rollup/plugin-node-resolve');

function rollupFeaturesPlugin() {
    const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');

    return {
        name: 'rollup-plugin-lwc-features',
        transform(source) {
            return babel.transform(source, {
                plugins: [babelFeaturesPlugin],
            }).code;
        },
    };
}

const banner = `/* proxy-compat-disable */`;
const formats = ['es', 'cjs'];

module.exports = function ({ root, name, input = 'src/index.ts', featureFlags = false }) {
    const { version, dependencies = {}, peerDependencies = {} } = require(path.resolve(
        root,
        './package.json'
    ));
    const footer = `/* version: ${version} */`;

    return {
        input: path.resolve(root, input),

        external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],

        output: formats.map((format) => ({
            file: path.resolve(root, `./dist/${name}${format === 'cjs' ? '.cjs' : ''}.js`),
            exports: 'named',
            format,
            banner,
            footer,
        })),

        plugins: [
            nodeResolvePlugin(),
            typescriptPlugin({
                target: 'es2017',
            }),
            featureFlags && rollupFeaturesPlugin(),
        ],

        onwarn({ code, message }) {
            if (code !== 'CIRCULAR_DEPENDENCY') {
                throw new Error(message);
            }
        },
    };
};
