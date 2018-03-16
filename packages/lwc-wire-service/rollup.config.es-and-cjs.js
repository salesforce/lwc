/* eslint-env node */

const path = require('path');
const rollupCompatPlugin = require('rollup-plugin-compat').default;
const typescript = require('rollup-plugin-typescript');
const { version } = require('./package.json');
const { generateTargetName } = require('./rollup.config.util');

const entry = path.resolve(__dirname, 'src/index.ts');
const commonJSDirectory = path.resolve(__dirname, 'dist/commonjs');
const modulesDirectory = path.resolve(__dirname, 'dist/modules');

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target } = config;
    const isCompat = target === 'es5';

    let plugins = [
        typescript({ target: target, typescript: require('typescript') }),
        isCompat && rollupCompatPlugin({ polyfills: false, disableProxyTransform: true }),
    ].filter(Boolean);

    const targetName = generateTargetName(config);
    const targetDirectory = (format === 'es' ? modulesDirectory : commonJSDirectory) + `/${target}`;

     return {
        input: entry,
        output: {
            file: path.join(targetDirectory, targetName),
            name: 'WireService',
            format,
            banner,
            footer,
        },
        plugins,
    }
}

module.exports = [
    rollupConfig({ format:'es', target:'es2017' }),
    rollupConfig({ format:'cjs', target:'es2017' }),
    rollupConfig({ format: 'cjs', target: 'es5' }),
];
