/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const rollupReplace = require('@rollup/plugin-replace');
const swc = require('@swc/core');
const { generateTargetName } = require('./helpers');

function compatPlugin() {
    return {
        name: 'rollup-plugin-compat',
        transform(source) {
            const { code } = swc.transformSync(source, {
                sourceMaps: false,
                jsc: {
                    target: 'es5',
                },
            });
            return { code };
        },
    };
}

function minifyPlugin() {
    return {
        name: 'rollup-plugin-minify',
        renderChunk(code, chunk, outputOptions) {
            return swc.minifySync(code, {
                sourceMap: false,
                mangle: {
                    topLevel: ['cjs', 'commonjs'].includes(outputOptions.format),
                },
                compress: true,
            });
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
                        values: {
                            'process.env.NODE_ENV': JSON.stringify('production'),
                        },
                        preventAssignment: true,
                        sourceMap: false, // increases the build time and we don't need it
                    }),
                compatMode && compatPlugin(),
            ],
        },
        outputOptions: {
            name,
            file: path.join(targetDirectory, target, generateTargetName(config)),
            format,
            plugins: [prod && !debug && minifyPlugin()],
        },
        display: { name, dir, format, target, prod, debug },
    };
}

async function generateTarget({ bundle, outputOptions, display, workerId }) {
    const msg = [
        `module: ${path.basename(display.dir)}`.padEnd(25, ' '),
        `format: ${display.format}`.padEnd(16, ' '),
        `target: ${display.target}`.padEnd(14, ' '),
        `min: ${display.prod}`.padEnd(10, ' '),
        `debug: ${display.debug}`.padEnd(12, ' '),
        `worker: ${workerId}`.padEnd(10, ' '),
    ].join(' | ');

    await bundle.write(outputOptions);

    process.stdout.write(`${msg} ✓\n`);
}

module.exports = {
    generateTarget,
    rollupConfig,
};
