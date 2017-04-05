/* eslint-env node */

const path = require('path');

const BENCHMARK_DIR = path.resolve(__dirname, '../src');

module.exports = {
    DIST_DIR: path.resolve(__dirname, '../dist'),

    BENCHMARK_DIR,
    BENCHMARK_ENTRY: path.resolve(BENCHMARK_DIR, 'main.benchmark.js'),

    RUNNER_DIR: path.resolve(__dirname, '../runner'),

    FILES: {
        info: 'info.json',
        bundle: 'bundle.js',
        app: 'app.js',
        runner: 'iframe-runner.js'
    },

    RUNNER_PATH: path.resolve(__dirname, '../runner/runner.js'),
    DRY_RUN_CONFIG: {
        minSampleCount: 1,
        maxDuration: 0,
    },
};
