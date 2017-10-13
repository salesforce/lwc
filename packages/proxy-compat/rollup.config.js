/* eslint-env node */

const path = require('path');
const typescript = require('rollup-plugin-typescript');
const uglify = require('rollup-plugin-uglify');

const { version } = require('./package.json');

const mainEntry = path.resolve(__dirname, 'src/main.ts');
const noopEntry = path.resolve(__dirname, 'src/main-noop.ts');

const umdDirectory = path.resolve(__dirname, 'dist/umd');
const commonJSDirectory = path.resolve(__dirname, 'dist/commonjs');
const modulesDirectory = path.resolve(__dirname, 'dist/modules');

const moduleName = 'Proxy';

const banner = (
`/*
 * Copyright (C) 2018 Salesforce, inc.
 */
`
);

const footer = `/** version: ${version} */`;

const baseRollupConfig = {
    moduleName,
    banner,
    footer,
};

function rollupConfig({ noop, formats, prod }) {
    const plugins = [];

    plugins.push(typescript({ typescript: require('typescript') }));

    if (prod) {
        const { minify } = require('uglify-es');
        plugins.push(uglify({}, code => minify(code)));
    }

    const targets = formats.map(format => {
        const targetDirectory = format === 'umd' ? umdDirectory : format === 'es' ? modulesDirectory : commonJSDirectory;

        const targetName = [
            'proxy-compat',
            noop ? '-noop' : '',
            prod ? '.min' : '',
            '.js'
        ].join('');

        return { format, dest: path.join(targetDirectory, targetName) };
    });

    return Object.assign({}, baseRollupConfig, {
        entry: noop ? noopEntry: mainEntry,
        targets,
        plugins
    });
}

module.exports = [

    // DEV & PROD mode
    rollupConfig({ formats: ['umd', 'cjs', 'es'] }),
    rollupConfig({ formats: ['umd'], prod: true }),

    // NOOP
    rollupConfig({ noop: true, formats: ['umd'] }),
    rollupConfig({ noop: true, formats: ['umd'], prod: true })

];
