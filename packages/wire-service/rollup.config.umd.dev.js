/* eslint-env node */

const path = require('path');
const strip = require('rollup-plugin-strip-caridy-patched');
const uglify = require('rollup-plugin-uglify');

const replace = require('rollup-plugin-replace');

const { minify } = require('uglify-es');
const { version } = require('./package.json');

const input = path.resolve(__dirname, 'src/main.js');
const outputDir = path.resolve(__dirname, 'dist/umd');

const { generateTargetName } = require('./rollup.config.util');
const banner = (
    `/*
     * Copyright (C) 2017 salesforce.com, inc.
     */
    `
);
const footer = `/** version: ${version} */`;

function rollupConfig({target, format}) {

    let plugins = [
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
            exclude: 'node_modules/**'
        })
    ].filter((plugin) => plugin)

    const targetName = generateTargetName(arguments[0]);
    const config = {
        input: input,
        name: "wire-service",
        banner: banner,
        footer: footer,
        output: {
            file: path.join(outputDir + `/${target}`,  targetName),
            format: format
        },
        plugins: plugins.filter( (plugin) => plugin )
    }
    return config;
}

module.exports = [
    rollupConfig({format:'umd', target:'es5'}),
    rollupConfig({format:'umd', target:'es2017'})
]
