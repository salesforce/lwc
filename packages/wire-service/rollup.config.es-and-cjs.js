/* eslint-env node */

const path = require('path');
const strip = require('rollup-plugin-strip-caridy-patched');

const { version } = require('./package.json');

const input = path.resolve(__dirname, 'src/main.js');
const commonJSDirectory = path.resolve(__dirname, 'dist/commonjs');
const modulesDirectory = path.resolve(__dirname, 'dist/modules');
const { generateTargetName } = require('./rollup.config.util');

const name = 'wire-service';

const banner = (
    `/*
    * Copyright (C) 2017 salesforce.com, inc.
    */
    `
);
const footer = `/** version: ${version} */`;

const baseRollupConfig = {
    input,
    name,
    banner,
    footer,
};

function rollupConfig({ formats, target, test }) {
    const plugins = [
        test ? strip({ functions: ['console.log'], include: '**/*.ts'}) : '',
    ].filter((plugin) => plugin);

    const targets = formats.map(format => {
        const targetDirectory = (format === 'es' ? modulesDirectory : commonJSDirectory) + `/${target}`;
        const targetName = generateTargetName(arguments[0]);
        return {
            file: path.join(targetDirectory,  targetName),
            format
        }
    });

    return Object.assign({}, baseRollupConfig, {
        output: targets,
        plugins
    });
}

module.exports = [
    // DEV mode
    rollupConfig({ formats: ['cjs', 'es'], target: 'es2017' }),
    rollupConfig({ formats: ['cjs'], target: 'es5' }),

    // TEST mode
    // TODO: Remove this mode once the engine is less chatty by deafault. (W-3908810)
    rollupConfig({ formats: ['cjs'], test: true, target: 'es2017' }),
    rollupConfig({ formats: ['cjs'], test: true, target: 'es5' })
];
