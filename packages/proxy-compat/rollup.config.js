/* eslint-env node */

const path = require('path');
const typescript = require('rollup-plugin-typescript');
const uglify = require('rollup-plugin-uglify');

const { version } = require('./package.json');

const mainEntry = path.resolve(__dirname, 'src/main.ts');
const noopEntry = path.resolve(__dirname, 'src/main-noop.ts');

const distDirectory = path.resolve(__dirname, 'dist');
const libDirectory = path.resolve(__dirname, 'lib');

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
    const entry = noop ? noopEntry : mainEntry

    plugins.push(typescript({
        typescript: require('typescript'),
    }));

    if (prod) {
        const { minify } = require('uglify-es');
        plugins.push(uglify({}, code => minify(code)));
    }

    const targets = formats.map(format => {
        const isDist = format === 'umd';
        const targetDirectory = isDist ? distDirectory : libDirectory;

        let formatSuffix = '';
        if (format === 'cjs') {
            formatSuffix = '.common'
        } else if (format === 'es') {
            formatSuffix = '.es'
        }

        const targetName = [
            'proxy-compat',
            noop ? '-noop' : '',
            formatSuffix,
            prod ? '.min' : '',
            '.js'
        ].join('');

        return {
            format,
            dest: path.join(targetDirectory, targetName),
        }
    });

    return Object.assign({}, baseRollupConfig, {
        entry,
        targets,
        plugins
    });
}

module.exports = [

    // DEV mode
    rollupConfig({ formats: ['umd', 'cjs', 'es'] }),
    rollupConfig({ formats: ['umd', 'cjs', 'es'] }),

    // PROD mode
    rollupConfig({ formats: ['umd'], prod: true }),
    rollupConfig({ formats: ['umd'], prod: true }),

    // NOOP
    rollupConfig({ noop: true, formats: ['umd'] }),
    rollupConfig({ noop: true, formats: ['umd'], prod: true })

];
