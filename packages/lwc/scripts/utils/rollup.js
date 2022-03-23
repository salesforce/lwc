/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const babel = require('@babel/core');

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
    const { input, format, name, target, targetDirectory, dir, targetName } = config;
    const compatMode = target === 'es5';
    return {
        inputOptions: {
            input,
            plugins: [compatMode && babelCompatPlugin()],
        },
        outputOptions: {
            name,
            file: path.join(targetDirectory, target, `${targetName}.js`),
            format,
        },
        display: { name, dir, format, target },
    };
}

async function generateTarget({ bundle, outputOptions, display, workerId }) {
    const msg = [
        `module: ${path.basename(display.dir)}`.padEnd(25, ' '),
        `format: ${display.format}`.padEnd(16, ' '),
        `target: ${display.target}`.padEnd(14, ' '),
        `worker: ${workerId}`.padEnd(10, ' '),
    ].join(' | ');

    await bundle.write(outputOptions);

    process.stdout.write(`${msg} ✓\n`);
}

module.exports = {
    generateTarget,
    rollupConfig,
};
