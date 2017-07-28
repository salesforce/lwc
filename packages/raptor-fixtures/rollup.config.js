/* eslint-env node */

const path = require('path');
const babel = require('rollup-plugin-babel');
const compiler = require('raptor-compiler');
const raptorCompiler = require('rollup-plugin-raptor-compiler');

const baseConfig = {
    format: 'iife',
    external: ['engine'],
    globals: {
        'engine': 'Engine',
    },
    plugins: [
        raptorCompiler()
    ]
};

const fixtureApps = [
    { entry: 'app-hello-world.js', dest: 'hello-world.js' },
    { entry: 'app-custom-input.js', dest: 'custom-input.js' },
    { entry: 'app-list.js', dest: 'list.js' },
    { entry: 'app-record-layout.js', dest: 'record-layout.js' },
];

module.exports = fixtureApps.reduce((acc, app) => {
    const standard = Object.assign({}, baseConfig, {
        entry: path.resolve(__dirname, 'src', app.entry),
        dest: path.resolve(__dirname, 'dist', app.dest),
    });

    const compat = Object.assign({}, standard, {
        dest: standard.dest.replace('.js', '_compat.js'),
        plugins: [
            ...standard.plugins,
            babel({
                babelrc: false,
                exclude: 'node_modules/**',
                plugins: [
                    'transform-raptor-compat'
                ],
            })
        ]
    });

    return [
        ...acc,
        standard,
        compat
    ]
}, []);
