/* eslint-env node */

const webpack = require('webpack');

module.exports = function (env) {
    const nodeEnv = env && env.prod ? 'production' : 'development';
    const isProd = nodeEnv === 'production';
    const loaders = [];
    const plugins = [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
    ];

    let filename = 'compiler.js';

    if (isProd) {
        plugins.push(new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            compress: {
            warnings: true,
            }
        }));

        loaders.push({
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
            presets: ['es2015']
        }
        })
        filename = 'compiler.min.js';
    }

    return {
        target: 'node',
        entry: './packages/raptor-compiler-core/dist/index.js',
        output: {
            path: './dist/node',
            filename: filename,
            libraryTarget: "commonjs-module"
        },
        plugins: plugins,
        module: {
            loaders: loaders
        }
    };
}
