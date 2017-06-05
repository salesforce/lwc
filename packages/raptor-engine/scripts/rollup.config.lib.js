/* jshint node: true */

/**
 * This file builds the nodejs version in lib/ folder.
 */

const p = require('path');
const typescript = require('rollup-plugin-typescript');
const { copyright } = require('./utils.js');

module.exports = {
    entry: p.resolve('src/framework/main.ts'),
    targets: [
        { dest: 'lib/raptor.js', format: 'cjs' },
        { dest: 'lib/raptor.es.js', format: 'es' },
    ],
    banner: copyright,
    external: [],
    plugins: [
        typescript({
            typescript: require('typescript'),
        }),
    ],
};
