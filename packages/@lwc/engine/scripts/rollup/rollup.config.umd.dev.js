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

const { version } = require('../../package.json');
const { generateTargetName, ignoreCircularDependencies } = require('./utils');

const input = path.resolve(__dirname, '../../src/framework/main.ts');
const outputDir = path.resolve(__dirname, '../../dist/umd');

const banner = (`/* proxy-compat-disable */\ntypeof process === 'undefined' && (process = { env: { NODE_ENV: 'dev' } });`);
const footer = `/** version: ${version} */`;


function rollupConfig(config) {
    const { format, target } = config;
    const targetName = generateTargetName(config);
    return {
        input: input,
        onwarn: ignoreCircularDependencies,
        output: {
            name: "Engine",
            banner: banner,
            footer: footer,
            file: path.join(outputDir + `/${target}`,  targetName),
            format: format
        },
        plugins: [
            nodeResolve(),
            rollupTypescriptPlugin({
                target,
                typescript,
                include: [ '*.ts', '**/*.ts', '/**/node_modules/**/*.js' ],
            })
        ]
    }
}

module.exports = [
    rollupConfig({ format:'umd', target: 'es5' }),
    rollupConfig({ format:'umd', target: 'es2017' })
]
