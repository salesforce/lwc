/* eslint-env node */

const path = require('path');
const rollupReplacePlugin = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');
const rollupCompatPlugin = require('rollup-plugin-compat');
const { version } = require('./package.json');
const { generateTargetName } = require('./rollup.config.util');

const input = path.resolve(__dirname, 'src/index.ts');
const outputDir = path.resolve(__dirname, 'dist/umd');

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target } = config;
    const isCompat = target === 'es5';

    const plugins = [
        typescript({ target: target, typescript: require('typescript') }),
        rollupReplacePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }),
        isCompat && rollupCompatPlugin({ polyfills: false, disableProxyTransform: true }),
    ].filter(Boolean);


    return {
        input: input,
        output: {
            file: path.join(outputDir + `/${target}`,  generateTargetName(config)),
            name: "WireService",
            format,
            banner,
            footer,
        },
        plugins,
    }
}

module.exports = [
    rollupConfig({ format:'umd', target:'es5' }),
    rollupConfig({ format:'umd', target:'es2017' })
]

