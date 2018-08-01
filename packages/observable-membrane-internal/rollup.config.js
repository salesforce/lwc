/* eslint-env node */

const path = require('path');
const typescript = require('rollup-plugin-typescript');
const babelMinify = require('babel-minify');
const { version } = require('./package.json');

const input = path.resolve(__dirname, 'src/main.ts');
const umdDirectory = path.resolve(__dirname, 'dist/umd');
const commonJSDirectory = path.resolve(__dirname, 'dist/commonjs');
const modulesDirectory = path.resolve(__dirname, 'dist/modules');

const name = 'ObservableMembrane';

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

const baseRollupConfig = {
    input,
    name,
    banner,
    footer,
};


function inlineMinifyPlugin() {
    return {
        transformBundle(code) {
            return babelMinify(code);
        }
    };
}

function rollupConfig({ formats, prod }) {
    const plugins = [
        typescript({ target: 'es5', typescript: require('typescript') }),
        prod && inlineMinifyPlugin({})
    ].filter(Boolean);

    const output = formats.map(format => {
        const targetDirectory = format === 'umd' ? umdDirectory :  format === 'es' ? modulesDirectory : commonJSDirectory;

        const targetName = [
            'observable-membrane-internal',
            prod ? '.min' : '',
            '.js'
        ].join('');

        return {
            name: 'ObservableMembrane',
            format,
            file: path.join(targetDirectory, targetName),
        }
    });

    return Object.assign({}, baseRollupConfig, {
        output,
        plugins
    });
}

module.exports = [
    // DEV & PROD
    rollupConfig({ formats: ['umd', 'cjs', 'es'], prod: false }),
    rollupConfig({ formats: ['umd'], prod: true })
];
