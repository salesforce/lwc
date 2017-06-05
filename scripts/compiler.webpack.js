/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const ClosureCompilerPlugin = require('webpack-closure-compiler');
const compilerPkg = require('../packages/raptor-compiler-core/package.json');

module.exports = function (/*env*/) {
    return [{
        entry: path.resolve(__dirname, '../packages/raptor-compiler-core/src/index.js'),
        output: {
            library: 'compiler',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, '../dist/compiler/umd'),
            filename: 'compiler.min.js',
        },
        node: {
            fs: 'empty',
            process: true,
            module: 'empty',
            net: 'empty',
        },
        plugins: [
            new webpack.DefinePlugin({ 'process.hrtime': 'Date.now' }),
            new StringReplacePlugin(),
            new ClosureCompilerPlugin({
                compiler: {
                    language_in: 'ES6',
                    language_out: 'ES5',
                    compilation_level: 'SIMPLE'
                },
                concurrency: 4,
            })
        ],
        module: {
            loaders: [{
                test: /index.js$/,
                loader: StringReplacePlugin.replace({
                    replacements: [{
                        pattern: /__VERSION__/ig,
                        replacement: () => compilerPkg.version
                    }]
                })
            }]
        }
    }]
}
