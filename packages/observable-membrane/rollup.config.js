/* eslint-env node */

const path = require('path');
const babel = require("@babel/core");
const minify = require("babel-preset-minify");
const typescript = require('rollup-plugin-typescript');

const { version } = require('./package.json');

const input = path.resolve(__dirname, 'src/main.ts');
const umdDirectory = path.resolve(__dirname, 'dist/umd');
const commonJSDirectory = path.resolve(__dirname, 'dist/commonjs');
const modulesDirectory = path.resolve(__dirname, 'dist/modules');

const name = 'ObservableMembrane';

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
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

function rollupConfig({ formats, prod }) {
    const plugins = [
        typescript({ target: 'es5', typescript: require('typescript') }),
        prod && inlineMinifyPlugin({})
    ].filter(Boolean);

    const output = formats.map(format => {
        const targetDirectory = format === 'umd' ? umdDirectory :  format === 'es' ? modulesDirectory : commonJSDirectory;

        const targetName = [
            'observable-membrane',
            prod ? '.min' : '',
            '.js'
        ].join('');

        return {
            name,
            format,

            file: path.join(targetDirectory, targetName),

            banner,
            footer,
        };
    });

    return {
        input,
        output,
        plugins,
    };
}

module.exports = [
    // DEV & PROD
    rollupConfig({ formats: ['umd', 'cjs', 'es'], prod: false }),
    rollupConfig({ formats: ['umd'], prod: true })
];
