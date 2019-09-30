/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const { rollup } = require('rollup');
const typescript = require('typescript');
const rollupTypescriptPlugin = require('rollup-plugin-typescript');
const rollupReplace = require('rollup-plugin-replace');
const { terser: rollupTerser } = require('rollup-plugin-terser');
const { generateTargetName } = require('./helpers');

function rollupConfig(config) {
    const { input, format, name, prod, target, targetDirectory, dir, debug = false } = config;
    const compatMode = target === 'es5';
    return {
        inputOptions: {
            input,
            plugins: [
                prod && rollupReplace({ 'process.env.NODE_ENV': JSON.stringify('production') }),
                compatMode && rollupTypescriptPlugin({ target, typescript, include: ['/**/*.js'] }),
                prod && !debug && rollupTerser(),
            ],
        },
        outputOptions: {
            name,
            file: path.join(targetDirectory, target, generateTargetName(config)),
            format,
        },
        display: { name, dir, format, target, prod, debug },
    };
}

async function generateTarget({ inputOptions, outputOptions, display }) {
    const msg = [
        `module: ${path.basename(display.dir)}`.padEnd(25, ' '),
        `format: ${display.format}`.padEnd(12, ' '),
        `target: ${display.target}`.padEnd(14, ' '),
        `min: ${display.prod}`.padEnd(10, ' '),
        `debug: ${display.debug}`.padEnd(12, ' '),
        `pid: ${process.pid}`.padEnd(10, ' '),
    ].join(' | ');

    const bundle = await rollup(inputOptions);
    await bundle.write(outputOptions);
    process.stdout.write(`${msg} ✓\n`);
}

module.exports = {
    generateTarget,
    rollupConfig,
};
