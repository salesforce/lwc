/* eslint-env node */

const fs = require('fs');
const path = require('path');
const lwcCompiler = require('rollup-plugin-lwc-compiler');

const stubs = [];
const pathToStubs = path.resolve(__dirname, 'src', 'stubs');
fs.readdirSync(pathToStubs).forEach(file => {
    if (fs.statSync(path.resolve(pathToStubs, file)).isFile()) {
        stubs.push(file);
    }
});

module.exports = stubs.reduce((acc, stub) => {
    const config = {
        input: path.resolve(pathToStubs, stub),
        output: {
            format: 'cjs',
            file: path.resolve(__dirname, 'dist', stub),
        },
        plugins: [
            lwcCompiler()
        ]
    };

    return [
        ...acc,
        config
    ];
}, []);
