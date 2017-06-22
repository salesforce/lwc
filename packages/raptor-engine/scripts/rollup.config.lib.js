/* jshint node: true */

/**
 * This file builds the nodejs version in lib/ folder.
 */

const p = require('path');
const typescript = require('rollup-plugin-typescript');
const { copyright } = require('./utils.js');
const strip = require('rollup-plugin-strip-caridy-patched');
const isTest = process.env.NODE_ENV === 'test';

const stripConfig = {
    debugger  : false,
    functions : ['console.*'],
    include   : '**/*.ts',
};

module.exports = {
    entry: p.resolve('src/framework/main.ts'),
    targets: isTest ? [
        { dest: 'lib/raptor.test.js', format: 'cjs' }
        ] : [
        { dest: 'lib/raptor.js', format: 'cjs' },
        { dest: 'lib/raptor.es.js', format: 'es' },
    ],
    banner: copyright,
    external: [],
    plugins: [
        typescript({
            typescript: require('typescript'),
        }),
        isTest && strip(stripConfig),
    ],
};
