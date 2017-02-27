/* eslint-env node */
const webpack = require('webpack');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const pkg = require('../packages/raptor-compiler-core/package.json');
const ClosureCompilerPlugin = require('webpack-closure-compiler');

module.exports = function (env) {
    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv === 'production';
    const loaders = [{
        test: /index.js$/,
        loader: StringReplacePlugin.replace({
            replacements: [{
                pattern: /__VERSION__/ig,
                replacement: () => pkg.version
            }]
        })
    }];

    const plugins = [
        new webpack.DefinePlugin({'process.hrtime': 'performance.now'}),
        new StringReplacePlugin(),
    ];

    let filename = 'compiler.js';

    if (isProd) {
        loaders.push({
            test: /\.js$/,
            loader: 'babel-loader',
            query: { presets: ['es2015'] }
        });

        plugins.push(new ClosureCompilerPlugin({
          compiler: {
            language_in: 'ECMASCRIPT6',
            language_out: 'ECMASCRIPT5',
            compilation_level: 'SIMPLE_OPTIMIZATIONS'
          },
          concurrency: 3,
        }));

        filename = 'compiler.min.js';
    }

    return {
        entry: './packages/raptor-compiler-core/dist/index.js',
        output: {
            path: './dist/web/',
            filename: filename,
            libraryTarget: 'this',
            library: 'compiler'
        },
        node: {
          fs: 'empty',
          module: 'empty',
          net: 'empty',
        },
        plugins: plugins,
        module: {
            loaders: loaders
        }
    };
}