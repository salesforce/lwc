/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const path = require('path');
const replace = require('rollup-plugin-replace');
const typescript = require('typescript');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');
const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require("@babel/core");
const minify = require("babel-preset-minify");

const { version } = require('../../package.json');
const { generateTargetName, ignoreCircularDependencies } = require('./utils');

const entry = path.resolve(__dirname, '../../src/framework/main.ts');
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
        }
    };
}

function rollupConfig(config){
    const { format, target, prod } = config;
    let plugins = [
        nodeResolve(),
        rollupTypescriptPlugin({
            typescript,
            target, module: 'es6',
            sourceMap: false,
            include: [ '*.ts', '**/*.ts', '/**/node_modules/**/*.js' ],
        }),
        replace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
        prod && inlineMinifyPlugin({})
    ].filter(p => p);

    const targetName = generateTargetName(config);

    // sourceMap issue: https://github.com/mjeanroy/rollup-plugin-license/issues/6
    return {
        input: entry,
        output: {
            file: path.join(outputDir + `/${target}`,  targetName),
            format: format,
            name: "Engine",
            banner: banner,
            footer: footer,
        },
        onwarn: ignoreCircularDependencies,
        plugins
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

