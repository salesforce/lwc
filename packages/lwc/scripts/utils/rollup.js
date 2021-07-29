/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const { promisify } = require('util');
const fs = require('fs');
const rollupReplace = require('@rollup/plugin-replace');
const babel = require('@babel/core');
const terser = require('terser');
const babelFeaturesPlugin = require('@lwc/features/src/babel-plugin');
const { generateTargetName } = require('./helpers');

const writeFile = promisify(fs.writeFile);

function rollupFeaturesPlugin(prod) {
    return {
        name: 'rollup-plugin-lwc-features',
        transform(source) {
            return babel.transform(source, {
                plugins: [[babelFeaturesPlugin, { prod }]],
            }).code;
        },
    };
}

function babelCompatPlugin() {
    return {
        name: 'rollup-plugin-babel-compat',
        transform(source) {
            const { code, map } = babel.transformSync(source, {
                babelrc: false,
                configFile: false,
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            targets: {
                                ie: '11',
                            },
                            modules: false,
                        },
                    ],
                ],
            });
            return { code, map };
        },
    };
}

function rollupConfig(config) {
    const { input, format, name, prod, target, targetDirectory, dir, debug = false } = config;
    const compatMode = target === 'es5';
    return {
        inputOptions: {
            input,
            plugins: [
                prod &&
                    rollupReplace({
                        'process.env.NODE_ENV': JSON.stringify('production'),
                        preventAssignment: true,
                    }),
                rollupFeaturesPlugin(prod),
                compatMode && babelCompatPlugin(),
            ],
        },
        outputOptions: {
            name,
            file: path.join(targetDirectory, target, generateTargetName(config)),
            format,
        },
        display: { name, dir, format, target, prod, debug },
        minify: prod && !debug,
    };
}

async function generateTarget({ bundle, outputOptions, display, minify }) {
    const msg = [
        `module: ${path.basename(display.dir)}`.padEnd(25, ' '),
        `format: ${display.format}`.padEnd(12, ' '),
        `target: ${display.target}`.padEnd(14, ' '),
        `min: ${display.prod}`.padEnd(10, ' '),
        `debug: ${display.debug}`.padEnd(12, ' '),
        `pid: ${process.pid}`.padEnd(10, ' '),
    ].join(' | ');

    if (minify) {
        // We don't use rollup-plugin-terser because we want to minify the whole file at the end,
        // which is more efficient than doing it as part of the input pipeline which would require
        // minifying the same source file multiple times.
        const { output } = await bundle.generate(outputOptions);
        const { code } = await terser.minify(output[0].code, {
            // In CommonJS, none of the toplevel variables matter - just the module.exports
            toplevel: outputOptions.format === 'commonjs',
        });
        await writeFile(outputOptions.file, code, 'utf-8');
    } else {
        await bundle.write(outputOptions);
    }

    process.stdout.write(`${msg} ✓\n`);
}

module.exports = {
    generateTarget,
    rollupConfig,
};
