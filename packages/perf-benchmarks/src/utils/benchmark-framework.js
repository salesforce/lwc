/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Lightweight Best.js-like "framework" that just runs the benchmark and does a performance.mark/measure
 * to measure the total time.
 */

const befores = [];
const runs = [];
const afters = [];

let error = false;

function benchmark(name, callback) {
    // ignore the name; we don't need it
    callback();
}

function before(callback) {
    befores.push(callback);
}

function after(callback) {
    afters.push(callback);
}

function run(callback) {
    if (runs.length) {
        error = new Error('best-tachometer-shim only supports 1 run() call total');
        throw error;
    }
    runs.push(callback);
    Promise.resolve().then(runBenchmark);
}

async function runBenchmark() {
    if (error) {
        // Don't run if there's an error; that would be misleading
        // eslint-disable-next-line no-console
        console.error(error);
        return;
    }
    performance.mark('benchmark-before-start');
    await Promise.all(befores.map((before) => before()));
    performance.measure('benchmark-before', 'benchmark-before-start');
    performance.mark('benchmark-run-start');
    await runs[0](); // only support one run()
    performance.measure('benchmark-run', 'benchmark-run-start');
    performance.mark('benchmark-after-start');
    await Promise.all(afters.map((after) => after()));
    performance.measure('benchmark-after', 'benchmark-after-start');
    console.log('Benchmark complete'); // eslint-disable-line no-console
}

export { benchmark, before, after, run };
