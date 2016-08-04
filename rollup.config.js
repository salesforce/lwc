/*jshint node: true */

import * as p from 'path';
import * as fs from 'fs';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import typescript from 'rollup-plugin-typescript';
import strip from 'rollup-plugin-strip';

const isProduction = process.env.BUILD === 'production';

let babelConfig = JSON.parse(fs.readFileSync('src/.babelrc', 'utf8'));
babelConfig.babelrc = false;
babelConfig.presets = babelConfig.presets.map((preset) => {
    return preset === 'es2015' ? 'es2015-rollup' : preset;
});

let plugins = [
    // typescript(), // TODO: we should enable typescript at some point
    babel(babelConfig),
    commonjs({
        sourceMap: true
    })
];

if (isProduction) {
    plugins.push(
        uglify({
            warnings: false
        })
    );
    plugins.push(
        strip({
            debugger: true,
            functions: [ 'console.*', 'assert.*' ],
        })
    );
}

export default {
    entry: 'src/framework/main.js',
    plugins,
    targets: [{
        dest: 'fake-cdn/fw.js',
        format: 'umd',
        moduleName: '$A',
        sourceMap: true,
    }]
};
