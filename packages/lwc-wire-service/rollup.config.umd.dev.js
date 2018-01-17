/* eslint-env node */

const path = require('path');
const replace = require('rollup-plugin-replace');
const babel = require('rollup-plugin-babel');

const { version } = require('./package.json');
const { generateTargetName } = require('./rollup.config.util');
const { compatBrowsersPreset } = require('../../scripts/babel-config-util');

const input = path.resolve(__dirname, 'src/main.js');
const outputDir = path.resolve(__dirname, 'dist/umd');

const banner = (`/**\n * Copyright (C) 2017 salesforce.com, inc.\n */`);
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target } = config;
    const isCompat = target === 'es5';

    let plugins = [
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
        }),
        isCompat && babel({
            presets: [ compatBrowsersPreset ],
            plugins: [ "external-helpers" ],
            babelrc: false,
        }),
    ].filter((plugin) => plugin);

    const targetName = generateTargetName(config);

    return {
        input: input,
        output: {
            file: path.join(outputDir + `/${target}`,  targetName),
            name: "WireService",
            format,
            banner,
            footer,
        },
        plugins,
    }
}

module.exports = [
    rollupConfig({format:'umd', target:'es5'}),
    rollupConfig({format:'umd', target:'es2017'})
]

