
/* eslint-env node */

const path = require('path');
const strip = require('rollup-plugin-strip-caridy-patched');
const uglify = require('rollup-plugin-uglify');

const replace = require('rollup-plugin-replace');

const { minify } = require('uglify-es');
const { version } = require('./package.json');

const entry = path.resolve(__dirname, 'src/main.js');
const outputDir = path.resolve(__dirname, 'dist/umd');
const { generateTargetName } = require('./rollup.config.util');

const banner = (
    `/*
     * Copyright (C) 2017 salesforce.com, inc.
     */
    `
);
const footer = `/** version: ${version} */`;

function rollupConfig({format, target, proddebug}){
    let plugins = [
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            exclude: 'node_modules/**'
        }),
        strip({
            functions: ['console.log', 'assert.*'],
            include   : '**/*.ts',
        }),
        proddebug ? "" : uglify({}, code => minify(code))
    ].filter((plugin) => plugin);

    const targetName = generateTargetName(arguments[0]);
    const config = {
        name: "wire-service",
        banner: banner,
        footer: footer,
        input: entry,
        output: {
            file: path.join(outputDir + `/${target}`,  targetName),
            format: format,
        },
        plugins: plugins.filter( (plugin) => plugin )
    }
    // sourceMap issue: https://github.com/mjeanroy/rollup-plugin-license/issues/6
    return config;
}

module.exports = [
    // PROD
    rollupConfig({format: 'umd', prod: true, target: 'es5'} ),
    rollupConfig({format: 'umd', prod: true, target: 'es2017'}),

    // PRODDEBUG mode
    rollupConfig({ format: 'umd', proddebug: true, target: 'es2017' }),
    rollupConfig({ format: 'umd', proddebug: true, target: 'es5' })
]

