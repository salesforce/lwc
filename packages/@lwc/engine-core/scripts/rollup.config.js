/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/* eslint-env node */

const path = require('path');

const { nodeResolve } = require('@rollup/plugin-node-resolve');
const typescriptPlugin = require('@rollup/plugin-typescript');

const babel = require('@babel/core');
const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');
const writeDistAndTypes = require('../../../../scripts/rollup/writeDistAndTypes');

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

const { version, dependencies, peerDependencies } = require('../package.json');

const banner = `/* proxy-compat-disable */`;
const footer = `/* version: ${version} */`;
const formats = ['es', 'cjs'];

module.exports = {
    input: path.resolve(__dirname, '../src/index.ts'),

    output: formats.map((format) => {
        return {
            file: `engine-core${format === 'cjs' ? '.cjs' : ''}.js`,
            format,
            banner: banner,
            footer: footer,
        };
    }),

    plugins: [
        nodeResolve({
            resolveOnly: [/^@lwc\//, 'observable-membrane'],
        }),
        typescriptPlugin({
            target: 'es2017',
            tsconfig: path.join(__dirname, '../tsconfig.json'),
        }),
        writeDistAndTypes(),
        rollupFeaturesPlugin(),
    ],

    onwarn({ code, message }) {
        if (code !== 'CIRCULAR_DEPENDENCY') {
            throw new Error(message);
        }
    },

    external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
};
