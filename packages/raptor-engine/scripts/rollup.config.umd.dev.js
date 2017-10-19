const path = require('path');
const strip = require('rollup-plugin-strip-caridy-patched');
const uglify = require('rollup-plugin-uglify');

const replace = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript');

const { minify } = require('uglify-es');
const { version } = require('../package.json');

const input = path.resolve(__dirname, '../src/framework/main.ts');
const outputDir = path.resolve(__dirname, '../dist/umd');

const { generateTargetName } = require('./engine.rollup.config.util');
const banner = (
    `/*
     * Copyright (C) 2017 salesforce.com, inc.
     */
    `
);
const footer = `/** version: ${version} */`;

function rollupConfig({target, format}) {

    let plugins = [
        typescript({
            target: target,
            typescript: require('typescript'),
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
            exclude: 'node_modules/**'
        })
    ].filter((plugin) => plugin)

    const targetName = generateTargetName(arguments[0]);
    const config = {
        input: input,
        name: "Engine",
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
