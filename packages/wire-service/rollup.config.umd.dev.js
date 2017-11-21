/* eslint-env node */

const path = require('path');
const replace = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');

const { version } = require('./package.json');
const { generateTargetName } = require('./rollup.config.util');

const input = path.resolve(__dirname, 'src/main.js');
const outputDir = path.resolve(__dirname, 'dist/umd');

const banner = (
    `/*
     * Copyright (C) 2017 salesforce.com, inc.
     */
    `
);
const footer = `/** version: ${version} */`;

function rollupConfig(config) {
    const { format, target } = config;
    const targetName = generateTargetName(config);
    return {
        input: input,
        name: "wire-service",
        banner: banner,
        footer: footer,
        output: {
            file: path.join(outputDir + `/${target}`,  targetName),
            format: format
        },
        plugins: [
            typescript({
                target: target,
                typescript: require('typescript'),
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('development')
            })
        ]
    }
}

module.exports = [
    rollupConfig({format:'umd', target:'es5'}),
    rollupConfig({format:'umd', target:'es2017'})
]

