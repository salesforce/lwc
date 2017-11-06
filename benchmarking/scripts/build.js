/* eslint-env node */

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const minimist = require('minimist');

const webpack = require('webpack');
const rollup = require('rollup');
const stripPlugin = require('rollup-plugin-strip');
const raptorPlugin = require('rollup-plugin-raptor-compiler');

const {
    DIST_DIR,
    FILES,
    BENCHMARK_ENTRY
} = require('./config');

const {
    sha1,
    getCommitHash,
    getRaptorVersion,
} = require('./helpers');

const webpackRunnerConfig = require('./webpack.config');

function getBundleInfo(name, code) {
    return {
        name,
        date: String(Date.now()),
        raptorVersion: getRaptorVersion(),
        commitHash: getCommitHash(),
        bundleHash: sha1(code),
    };
}

function saveBundle(bundlePath, bundleInfo, code) {
    fs.writeFileSync(
        path.resolve(bundlePath, FILES.info),
        JSON.stringify(bundleInfo, null, 4)
    );

    fs.writeFileSync(
        path.resolve(bundlePath, FILES.bundle),
        code
    );
}

function saveRunner(bundlePath) {
    const buildPromise = webpackRunnerConfig.map(config => {

        // Patch original output path
        config.output.path = bundlePath;

        return new Promise((resolve, reject) => {
            webpack(config, (err, stats) => {
                if (err) {
                    return reject(err);
                } else if (stats.hasErrors()) {
                    const info = stats.toJson();
                    return reject(info.errors);
                }

                resolve();
            })
        });
    });

    return Promise.all(buildPromise);
}

const argv = minimist(process.argv.slice(2), {
    default: {
        name: getCommitHash(true),
    }
});

console.log('Building bundle');
const bundlePath = path.resolve(DIST_DIR, argv.name);

rollup.rollup({
    // TODO: add support for multi-entry using with rollup-plugin-multi-entry
    entry: BENCHMARK_ENTRY,

    // TODO: remove me once Babel helpers is fixed
    onwarn: message => {
        if (/Babel helper is used more than once/.test(message)) return;
        console.error(message);
    },

    external: [ 'runner' ],
    plugins: [
        {
            resolveId(id) {
                if (id === 'engine') {
                    return require.resolve('raptor-engine/dist/modules/es2017/engine.js');
                }
            }
        },
        raptorPlugin({
            mapNamespaceFromPath: false,
            resolveFromPackages: false,
        }),
        stripPlugin({
            debugger: true,
            functions: [ 'console.*', 'assert.*' ],
        }),
    ],
}).then(bundle => (
    bundle.generate({
        format: 'umd',
        moduleName: 'bundle',
        globals: { runner: 'runner' }
    })
)).then(({ code }) => {
    console.log(`Storing bundle to ${bundlePath}`);
    mkdirp.sync(bundlePath);

    const bundleInfo = getBundleInfo(argv.name, code);
    return Promise.all([
        saveBundle(bundlePath, bundleInfo, code),
        saveRunner(bundlePath),
    ]);
});

// Throw an error and exit the process with status code different than 0 if the
// previous promise rejects
process.on('unhandledRejection', err => {
    console.error(err);
    process.exit(1);
});
