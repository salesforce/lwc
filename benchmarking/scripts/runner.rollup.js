/* eslint-env node */

const path = require('path');
const nodeResolvePlugin = require('rollup-plugin-node-resolve');
const raptorPlugin = require('rollup-plugin-raptor-compiler');

module.exports = {
    entry: path.resolve(__dirname, '../runner/manager/main.js'),
    dest: path.resolve(__dirname, '../dist/manager.js'),
    format: 'iife',
    moduleName: 'manager',
    globals: [
        'simple-statistics'
    ],
    plugins: [
        raptorPlugin({
            componentNamespace: 'manager'
        }),
        nodeResolvePlugin({
            module: true,
        })
    ],
};
