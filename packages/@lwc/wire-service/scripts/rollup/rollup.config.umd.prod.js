/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/* eslint-env node */

const path = require('path');
const babel = require("@babel/core");
const minify = require("babel-preset-minify");
const typescript = require('rollup-plugin-typescript');
const rollupReplacePlugin = require('rollup-plugin-replace');
const rollupCompatPlugin = require('rollup-plugin-compat');

const { version } = require('../../package.json');
const { generateTargetName } = require('./util');

const input = path.resolve(__dirname, '../../src/index.ts');
const outputDir = path.resolve(__dirname, '../../dist/umd');

const banner = (`/* proxy-compat-disable */`);
const footer = `/** version: ${version} */`;

const minifyBabelConfig = {
    babelrc: false,
    comments: false,
    presets: [minify],
};

function inlineMinifyPlugin() {
    return {
        transformBundle(code) {
            const result = babel.transform(code, minifyBabelConfig);
            return result.code;
        },
    };
}

function rollupConfig(config) {
    const { format, target, prod } = config;
    const isCompat = target === 'es5';

    const plugins = [
        typescript({ target: target, typescript: require('typescript') }),
        rollupReplacePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }),
        isCompat && rollupCompatPlugin({ polyfills: false, disableProxyTransform: true }),
        prod && inlineMinifyPlugin({})
    ].filter(Boolean);

    return {
        input: input,
        output: {
            file: path.join(outputDir + `/${target}`, generateTargetName(config)),
            name: "WireService",
            format,
            banner,
            footer,
        },
        plugins,
    }
}

module.exports = [
    // PROD
    rollupConfig({ format: 'umd', prod: true, target: 'es5' }),
    rollupConfig({ format: 'umd', prod: true, target: 'es2017' }),

    // PRODDEBUG mode
    rollupConfig({ format: 'umd', proddebug: true, target: 'es2017' }),
    rollupConfig({ format: 'umd', proddebug: true, target: 'es5' })
]
