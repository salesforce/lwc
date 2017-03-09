(function() {
    const MIN_SAMPLES = 30;
    const MAX_TIME = 5 * 1000;
    const BENCHMARK_NAME_REGEX = /^(?:[\da-z-_]+\/?)+$/;
    const SUITE = [];

    function markBegin(id, type) {
        performance.mark(`${id}::${type}`);
    }

    function markEnd(id, type) {
        const markName = `${id}::${type}`;
        performance.measure(markName, markName);

        performance.clearMarks(markName);
        performance.clearMeasures(markName);
    }

    function benchmark(config) {
        if (!config.name) {
            throw new Error('Missing name for benchmark.');
        } else if (!config.name.match(BENCHMARK_NAME_REGEX)) {
            throw new Error(`${config.name} is an invalid benchmark name.`);
        }

        if (!config.run) {
            throw new Error(`${config.name} benchmark should have a run function`);
        }

        SUITE.push(config);
    }

    function getRegisteredBenchmark() {
        return SUITE;
    }

    function isSamplingCompleted(benchmark, results, { minSampleCount, maxDuration }) {
        return results.samples.length >= minSampleCount &&
            Date.now() - results.startTime > maxDuration;
    }

    function runSampling(resolve, reject, benchmark, results, options) {
        const { debug } = options;

        const markBeginPhase = phase => debug && markBegin(benchmark.name, phase);
        const markEndPhase = phase => debug && markEnd(benchmark.name, phase);

        const before = function before() {
            if (benchmark.before) {
                markBeginPhase('before');
                try {

                    benchmark.before(run);
                    return;
                } catch (err) {
                    reject(err);
                }
                markEndPhase('before');
            }

            run();
        }

        const run = function run() {
            if (isSamplingCompleted(benchmark, results, options)) {
                resolve(results);
                return;
            }

            try {
                markBeginPhase('run');

                const timeStart = performance.now();
                benchmark.run(() => {
                    const timeEnd = performance.now();

                    markEndPhase('run');
                    results.samples.push(timeEnd - timeStart);
                    after();
                });
            } catch (err) {
                reject(err);
            }
        }

        const after = function after() {
            if (benchmark.after) {
                markBeginPhase('after');
                try {
                    benchmark.after(before);
                    return;
                } catch (err) {
                    reject(err);
                }
                markEndPhase('after');
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

        runSampling(resolveBenchmark, reject, benchmark, results, options);
    }

    function scheduleNextBenchmark(resolve, reject, suite, suiteResults, options) {
        setTimeout(() => (
            runBenchmark(resolve, reject, suite, suiteResults, options)
        ), 0);
    }

    function startBenchmarkSuite(options = {}) {
        let suite = SUITE;

        const {
            minSampleCount = MIN_SAMPLES,
            maxDuration = MAX_TIME,
            debug = false,
            grep,
        } = options;

        if (grep) {
            const regex = new RegExp(grep, 'i');
            suite = suite.filter(benchmark => benchmark.name.match(regex));
        }

        return new Promise((resolve, reject) => {
            const suiteResults = {
                startTime: Date.now(),
                results: []
            };

            scheduleNextBenchmark(resolve, reject, suite, suiteResults, {
                minSampleCount,
                maxDuration,
                debug
            });
        })
    }

    function runSingleBenchmark(name, options = {}) {
        if (typeof name !== 'string') {
            throw new Error('Missing name paramter');
        }

        const benchmark = SUITE.find(benchmark => benchmark.name === name);
        if (!benchmark) {
            throw new Error(`${name} is not a registered benchmark`);
        }

        const mergedOption = Object.assign({}, options, {
            grep: name
        });

        return startBenchmarkSuite(mergedOption).then(data => (
            data.results[0]
        ));
    }

    window.runner = {
        benchmark: benchmark,
        getRegisteredBenchmark: getRegisteredBenchmark,
        startBenchmark: startBenchmarkSuite,
        runSingleBenchmark: runSingleBenchmark,
    };
})();
