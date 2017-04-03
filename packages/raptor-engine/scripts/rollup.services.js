/*jshint node: true */

/**
 * This file builds the services.
 */

'use strict'

const path = require('path');
const argv = require('yargs').argv;
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const strip = require('rollup-plugin-strip');
const flow = require('rollup-plugin-flow');
const rollup = require('rollup');
const glob = require("glob");

const servicePlugins = [
    flow({ all: true }),
    babel({
        babelrc: false,
        presets: [
            [ "env", { "modules": false } ]
        ],
    }),
];

if (argv.production) {
    servicePlugins.push(
        strip({
            debugger: true,
            functions: [ 'console.*', 'assert.*' ],
        })
    );
    // fwPlugins.push(
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

// seaching for all services
glob.sync('src/services/*/*.js').forEach(function (p) {
    const entry = path.basename(p, '.js');
    p = path.dirname(p);
    const pieces = p.split(path.sep);
    const name = pieces.pop();
    if (name === entry) {
        configs.push({
            folder: p,
            input: {
                entry: path.join(p, name + '.js'),
                plugins: servicePlugins,
            },
            output: {
                dest: 'fake-cdn/' + name + '.js',
                format: 'amd',
                moduleId: ['raptor', name].join(':'),
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
