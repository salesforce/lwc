/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const StringReplacePlugin = require('string-replace-webpack-plugin');
const version = JSON.stringify(require("./package.json").version);

module.exports = {
    entry: path.resolve(__dirname, 'src/index.ts'),
    target: 'web',
    mode: 'production',
    output: {
        library: 'compiler',
        libraryTarget: 'umd',
        path: path.resolve(__dirname, 'dist/umd/'),
        filename: 'compiler.js',
        umdNamedDefine: true,
        globalObject: 'this'
    },
    node: {
        fs: 'empty',
        process: true,
        module: 'empty',
        net: 'empty',
    },
    resolve: {
        alias: {
            // Forcing the resolution of the CommonJS Module instead of the ES Module for the "rollup-plugin-replace".
            // There is a discrepancy between the 2 "rollup-plugin-replace" artifacts. Let's use the CommonJS one
            // to be consistent with the behavior when running the compiler in NodeJs.
            'rollup-plugin-replace': 'rollup-plugin-replace/dist/rollup-plugin-replace.cjs.js',
        },
        extensions: [ '.ts', '.js' ]
    },
    plugins: [
        new StringReplacePlugin(),
        new webpack.DefinePlugin({
            'process.hrtime': 'Date.now'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'awesome-typescript-loader',
                exclude: /node_modules/,
            },
            {
                test: /index.ts$/,
                loader: StringReplacePlugin.replace({
                    replacements: [{
                        pattern: /\'__VERSION__\'/ig,
                        replacement: () => version
                    }]
                })
            }
        ],
    }
};
