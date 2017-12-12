/* eslint-env node */
const path = require('path');
const webpack = require('webpack');
const StringReplacePlugin = require("string-replace-webpack-plugin");
const version = JSON.stringify(require("./package.json").version);

module.exports = function (/*env*/) {
    return [{
        entry: path.resolve(__dirname, 'src/index.js'),
        target: 'node',
        output: {
            library: 'compiler',
            libraryTarget: 'umd',
            path: path.resolve(__dirname, 'dist/umd/'),
            filename: 'compiler.js',
        },
        plugins: [
            new StringReplacePlugin()
        ],
        module: {
            loaders: [{
                test: /index.js$/,
                loader: StringReplacePlugin.replace({
                    replacements: [{
                        pattern: /\'__VERSION__\'/ig,
                        replacement: () => version
                    }]
                })
            }]
        }
    }]
};
