/* jshint node: true */

/**
 * This file builds the nodejs version in lib/ folder.
 */

const p = require('path');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const flow = require('rollup-plugin-flow');
const nodeResolve = require('rollup-plugin-node-resolve');
const { copyright } = require('./utils.js');

module.exports = {
    entry: p.resolve('src/framework/main.js'),
    targets: [
        { dest: 'lib/raptor.js', format: 'cjs' },
        { dest: 'lib/raptor.es.js', format: 'es' },
    ],
    banner: copyright,
    external: [],
    plugins: [
        flow({
            all: true,
            exclude: '**/node_modules/**',
        }),
        babel({
            babelrc: false,
            presets: [
                ["env", { "modules": false }]
            ],
        }),
        nodeResolve({ module: true }),
        commonjs({ sourceMap: false }),
    ],
};
