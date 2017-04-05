import {
    BASE_CONFIG,
} from '../shared/config';

import {
    registered as registeredBenchmarks,
} from './benchmark';

function getConfig(...overrides) {
    return Object.assign({}, BASE_CONFIG, ...overrides);
}

function isSamplingCompleted(benchmark, results, { minSampleCount, maxDuration }) {
    const reachMaxSample = results.samples.length >= minSampleCount;
    const reachedMaxTime = Date.now() - results.startTime > maxDuration;

    return  reachMaxSample && reachedMaxTime;
}

function runSampling(resolve, reject, benchmark, results, options) {
    const before = function before() {
        if (benchmark.before) {
            return benchmark.before(run);
        }

        run();
    }

    const run = function run() {
        if (isSamplingCompleted(benchmark, results, options)) {
            return resolve(results);
        }

        const timeStart = performance.now();
        benchmark.run(() => {
            const timeEnd = performance.now();
            results.samples.push(timeEnd - timeStart);

            after();
        });
    }

    const after = function after() {
        if (benchmark.after) {
            return benchmark.after(before);
        }

        before();
    }

    before();
}

function runBenchmark(resolve, reject, suite, suiteResults, options) {
    const benchmark = suite.shift();

    if (!benchmark) {
        resolve(suiteResults);
        return;
    }

    const resolveBenchmark = populatedResults => {
        suiteResults.results.push(populatedResults);
        scheduleNextBenchmark(resolve, reject, suite, suiteResults, options);
    }

    const results = {
        name: benchmark.name,
        startTime: Date.now(),
        samples: []
    }

    try {
        runSampling(resolveBenchmark, reject, benchmark, results, options);
    } catch (err) {
        reject(err);
    }
}

function scheduleNextBenchmark(resolve, reject, suite, suiteResults, options) {
    const {
        delay = 0
    } = options;

    setTimeout(() => (
        runBenchmark(resolve, reject, suite, suiteResults, options)
    ), delay);
}

export function startBenchmarkSuite(options = {}) {
    const config = getConfig(options);

    let suite = registeredBenchmarks;
    if (config.grep) {
        const regex = new RegExp(config.grep, 'i');
        suite = suite.filter(benchmark => benchmark.name.match(regex));
    }

    return new Promise((resolve, reject) => {
        const suiteResults = {
            startTime: Date.now(),
            results: []
        };

        runBenchmark(resolve, reject, suite, suiteResults, config);
    })
}

export function runSingleBenchmark(name, options = {}) {
    if (typeof name !== 'string') {
        throw new TypeError('Missing name paramter');
    }

    const isRegistered = registeredBenchmarks.find(benchmark => benchmark.name === name);
    if (!isRegistered) {
        throw new Error(`${name} is not a registered benchmark`);
    }

    const config = getConfig(options, { grep: name });
    return startBenchmarkSuite(config).then(data => (
        data.results[0]
    ));
}
