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
const isCompat = process.env.MODE === 'compat';
const needsStrip = isProduction || !isCompat;
const version = require('../package.json').version;

const stripConfig = {
    debugger  : isProduction,
    functions : (isProduction ? ['console.*', 'assert.*', 'alert'] : []).concat(isCompat ? [] : ['compat']),
    include   : '**/*.ts',
};

module.exports = {
    entry: p.resolve('src/framework/main.ts'),
    dest: p.resolve(`dist/engine${isCompat ? '_compat' : ''}.${isProduction ? 'min.js' : 'js'}`),
    format: 'iife',
    moduleName: 'Engine',
    banner: copyright,
    footer: `/** version: ${version} */`,
    sourceMap: true,
    globals: {},
    plugins: [
        typescript({ typescript: require('typescript') }),
        needsStrip && strip(stripConfig),
        isProduction && uglify({ warnings: false }),
    ].filter(Boolean),
};
