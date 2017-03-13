/* eslint-env node */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const mkdirp = require('mkdirp');
const rollup = require('rollup');
const babelPlugin = require('rollup-plugin-babel');
const nodeResolvePlugin = require('rollup-plugin-node-resolve');
const stripPlugin = require('rollup-plugin-strip');
const raptorPlugin = require('rollup-plugin-raptor-compiler');

const DEBUG_MODE = !!process.env.DEBUG;

const BUNDLES_DIR = path.resolve(__dirname, '../dist');
const BENCHMARK_DIR = path.resolve(__dirname, '../src');
const INFO_FILE_NAME = 'info.json';
const BUNDLE_FILE_NAME = 'bundle.js';

function sanatizeBuffer(buffer) {
    return buffer.toString().trim();
}

function getRaptorVersion() {
    const res = spawnSync('npm', ['list']);
    const output = res.stdout.toString();
    let [, raptorVerion] = output.match(/raptor-engine@([\d\.]+)/);

    return raptorVerion;
}

function getBundleInfo() {
    const bundleId = String(Date.now());
    const raptorVersion = getRaptorVersion();
    const commitHash = sanatizeBuffer(execSync('git rev-parse --short HEAD'));
    const commitBranch = sanatizeBuffer(execSync('git rev-parse --abbrev-ref HEAD'))
        .replace(/[\/\s]/ig, '-');

    return {
        id: bundleId,
        commit: commitHash,
        branch: commitBranch,
        debug: DEBUG_MODE,
        raptorVersion,
    };
}

function createSymlink(target, link) {
    if (fs.existsSync(link)) {
        fs.unlinkSync(link);
    }

    fs.symlinkSync(target, link);
}

function createFolderStructure(bundlePath, bundleInfo) {
    mkdirp.sync(bundlePath);

    const alias = [
        path.resolve(BUNDLES_DIR, 'HEAD'),
        path.resolve(BUNDLES_DIR, bundleInfo.commit),
        path.resolve(BUNDLES_DIR, bundleInfo.branch),
    ];

    for (let link of alias) {
        createSymlink(bundlePath, link);
    }

    return [
        bundlePath,
        ...alias,
    ]
}

const bundleInfo = getBundleInfo();
const bundleName = `bundle_${bundleInfo.id}_${bundleInfo.commit}_${bundleInfo.branch}${DEBUG_MODE ? '_debug' : ''}`;
const bundlePath = path.resolve(BUNDLES_DIR, bundleName);

// 1. Create folder structure
const alias = createFolderStructure(bundlePath, bundleInfo);

console.log(`Building bundle: ${bundleName}`);
console.log(alias.map(p => `    - ${p}`).join('\n'));

// 2. Create info file
fs.writeFileSync(
    path.resolve(bundlePath, INFO_FILE_NAME),
    JSON.stringify(bundleInfo, null, 4)
);

// 3. Create the actual bundle
rollup.rollup({
    // TODO: add support for multi-entry using with rollup-plugin-multi-entry
    entry: path.resolve(BENCHMARK_DIR, 'main.benchmark.js'),

    // Runner will be injecteted dynamically in the frame
    external: [ 'runner' ],

    plugins: [
        // Compile raptor html templates
        raptorPlugin({ componentNamespace: 'benchmark' }),

        // Allow to resolve raptor as a npm dependency
        nodeResolvePlugin({
            module: true
        }),

        !DEBUG_MODE && babelPlugin({
            babelrc: false,
            presets: [
                ['es2015', { "modules": false }]
            ],
        }),

        // Remove checks present in the raptor engine
        !DEBUG_MODE && stripPlugin({
            debugger: true,
            functions: [ 'console.*', 'assert.*' ],
        }),
    ].filter(Boolean),
}).then(bundle => {
    var result = bundle.generate({
        format: 'umd',
        moduleName: 'bundle',
        globals: { runner: 'runner' }
    });

    fs.writeFileSync(
        path.resolve(bundlePath, BUNDLE_FILE_NAME),
        result.code
    );
}).catch(err => (
    console.error(err)
));
