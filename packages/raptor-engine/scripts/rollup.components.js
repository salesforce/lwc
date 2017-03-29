/*jshint node: true */

/**
 * This file builds the fixtures to test the framework.
 */

'use strict'

const path = require('path');
const argv = require('yargs').argv;
const babel = require('rollup-plugin-babel');
const raptor = require('rollup-plugin-raptor-compiler');
const uglify = require('rollup-plugin-uglify');
const strip = require('rollup-plugin-strip');
const rollup = require('rollup');
const glob = require("glob");

const componentsPlugins = [
    babel({
        babelrc: false,
        presets: [
            [
                "es2015",
                {
                    "modules": false
                }
            ]
        ],
        plugins: [
            "external-helpers",
            "transform-class-properties",
        ],
        externalHelpers: true,
    }),
];

if (argv.production) {
    componentsPlugins.push(
        strip({
            debugger: true,
            functions: [ 'console.*', 'assert.*' ],
        })
    );
    // componentsPlugins.push(
    //     uglify({
    //         warnings: false
    //     })
    // );
}

function buildBundle(bundleConfig) {
    return rollup.rollup(bundleConfig.input)
        .then(function(bundle) {
            return bundle.write(bundleConfig.output);
        }).then(() => bundleConfig.output.dest);
}

function buildBundles(configs) {
    const promises = configs.map(buildBundle);
    return Promise.all(promises)
        .then((bundles) => {
            console.log('-> built %d bundles', configs.length)
            return bundles;
        });
}

const configs = [];

// seaching for all components in all namespaces
glob.sync('fixtures/namespaces/prototype/**/*.js').forEach(function (cmpPath) {
    const entry = path.basename(cmpPath, '.js');
    const p = path.dirname(cmpPath);
    const pieces = p.split(path.sep);
    const name = pieces.pop();
    const namespace = pieces.pop();
    if (name === entry) {
        configs.push({
            folder: p,
            input: {
                entry: cmpPath,
                plugins: [raptor({
                    mapNamespaceFromPath: true
                })].concat(componentsPlugins),
            },
            output: {
                dest: 'fake-cdn/components/' + name + '.js',
                format: 'amd',
                moduleId: [namespace, name].join(':'),
                sourceMap: true,
                globals: {
                    raptor: 'Raptor',
                },
            },
        });
    }
});

if (argv.watch) {
    console.log('watching...');

    const watch = require('watch');
    const EventEmitter = require('events');
    const watcher = new EventEmitter();

    configs.forEach((bundleConfig) => {
        watch.watchTree(bundleConfig.folder, function onFileChange() {
            buildBundle(bundleConfig)
                .then((dest) => {
                    console.log('-> built [%s] bundle', dest);
                    watcher.emit('rolled');
                })
                .catch((err) => {
                    console.error(err.stack)
                });
        })
    });
} else {
    console.log('building...');

    buildBundles(configs).catch((err) => {
        console.error(err.stack)
    });
}
