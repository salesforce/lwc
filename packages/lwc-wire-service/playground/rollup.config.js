/* eslint eslint-comments/no-use: off */
/* eslint-env node */
const path = require('path');
const lwcCompiler = require('rollup-plugin-lwc-compiler');
const replace = require('rollup-plugin-replace');

module.exports = {
    input: path.resolve('playground/app.js'),
    output: {
        file: path.resolve('playground/index.js'),
        format: 'iife',
        name: 'Main',
    },
    plugins: [
        lwcCompiler(),
        replace({ 'process.env.NODE_ENV': JSON.stringify('development') })
    ]
};
