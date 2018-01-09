/* eslint-env node */

const path = require('path');
const babel = require('rollup-plugin-babel');

const { version } = require('./package.json');
const { generateTargetName } = require('./rollup.config.util');
const { compatBrowsersPreset } = require('../../scripts/babel-config-util');

const entry = path.resolve(__dirname, 'src/main.js');
const commonJSDirectory = path.resolve(__dirname, 'dist/commonjs');
const modulesDirectory = path.resolve(__dirname, 'dist/modules');

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;


function rollupConfig(config) {
    const { format, target } = config;
    const isCompat = target === 'es5';

    let plugins = [
        isCompat && babel({
            presets: [ compatBrowsersPreset ],
            plugins: [ "external-helpers" ],
            babelrc: false,
        }),
    ].filter((plugin) => plugin);

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
