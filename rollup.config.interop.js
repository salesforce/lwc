/* jshint node: true */

/**
 * This file builds the browser version in dist/ folder.
 */

const p = require('path');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const flow = require('rollup-plugin-flow');
const strip = require('rollup-plugin-strip');
const { copyright } = require('./scripts/utils.js');

const isProduction = process.env.NODE_ENV === 'production';
const version = require('./package.json').version;

module.exports = {
    entry: p.resolve('src/framework/main.js'),
    dest: p.resolve(`dist/interop.${isProduction ? 'min.js' : 'js'}`),
    format: 'iife',
    moduleName: 'Engine',
    banner: copyright,
    footer: `/** version: ${version} */`,
    sourceMap: true,
    globals: {},
    plugins: [
        flow({
            all: true,
            exclude: '**/node_modules/**',
        }),
        babel({
            babelrc: false,
            presets: [
                [
                    "es2015",
                    {
                        "modules": false
                    }
                ]
            ],
        }),
        nodeResolve({
            module: true,
        }),
        commonjs({
            sourceMap: true,
        }),
        isProduction && strip({
            debugger: true,
            functions: [ 'console.*', 'assert.*' ],
        }),
        isProduction && uglify({
            warnings: false,
        }),
    ].filter(Boolean),
};
