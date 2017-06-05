/* jshint node: true */

/**
 * This file builds the browser version in dist/ folder.
 */

const p = require('path');
const uglify = require('rollup-plugin-uglify');
const strip = require('rollup-plugin-strip-caridy-patched');
const typescript = require('rollup-plugin-typescript');
const { copyright } = require('./utils.js');
const isProduction = process.env.NODE_ENV === 'production';
const version = require('../package.json').version;

module.exports = {
    entry: p.resolve('src/framework/main.ts'),
    dest: p.resolve(`dist/engine.${isProduction ? 'min.js' : 'js'}`),
    format: 'iife',
    moduleName: 'Engine',
    banner: copyright,
    footer: `/** version: ${version} */`,
    sourceMap: true,
    globals: {},
    plugins: [
        typescript({
            typescript: require('typescript'),
        }),
        isProduction && strip({
            debugger: true,
            functions: [ 'console.*', 'assert.*' ],
            include: '**/*.ts',
        }),
        isProduction && uglify({
            warnings: false,
        }),
    ].filter(Boolean),
};
