/* eslint-env node */

const path = require('path');
const typescript = require('rollup-plugin-typescript');
const uglify = require('rollup-plugin-uglify');

const { version } = require('./package.json');

const input = path.resolve(__dirname, 'src/main.ts');
const umdDirectory = path.resolve(__dirname, 'dist/umd');
const commonJSDirectory = path.resolve(__dirname, 'dist/commonjs');
const modulesDirectory = path.resolve(__dirname, 'dist/modules');

const name = 'ReactiveMembrane';

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

const baseRollupConfig = {
    input,
    name,
    banner,
    footer,
};

function rollupConfig({ formats, prod }) {
    const plugins = [];

    plugins.push(typescript({
        target: 'es5',
        typescript: require('typescript'),
    }));

    if (prod) {
        const { minify } = require('uglify-es');
        plugins.push(uglify({}, code => minify(code)));
    }

    const output = formats.map(format => {
        const targetDirectory = format === 'umd' ? umdDirectory :  format === 'es' ? modulesDirectory : commonJSDirectory;

        const targetName = [
            'reactive-membrane',
            prod ? '.min' : '',
            '.js'
        ].join('');

        return {
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
    rollupConfig({ formats: ['umd', 'cjs', 'es'] }),
    rollupConfig({ formats: ['umd'], prod: true })

];
