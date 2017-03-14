import { HTMLElement } from 'raptor-engine';

import {
    compare as compareSamples,
} from '../../../../shared/stats';

import {
    getBundles,
    getConfigFromQueryString,
    postResults,
    listBenchmarks,
    getBenchmarkStats
} from './utils';

const AUTO_START_DELAY = 1 * 1000;

const COMPARE_STYLES = {
    equal: 'slds-theme--warning',
    better: 'slds-theme--success',
    worse: 'slds-theme--error',
}

export default class Shell extends HTMLElement {
    constructor() {
        super();

        this.config = getConfigFromQueryString();

        this.done = false;
        this.isRunning = false;

        this.bundles = [];
        this.readyRunner = [];

        if (this.config.start) {
            setTimeout(() => this.startBenchmark(), AUTO_START_DELAY);
        }
    }

    get formattedResults() {
        // List all the unique benchmarks
        const benchmarkNames = this.bundles.reduce((arr, bundle) => (
            arr.concat(listBenchmarks(bundle))
        ), []);
        const benchmarkUnique = new Set(benchmarkNames);

        return Array.from(benchmarkUnique).map(name => {
            const results = this.bundles.map(bundle => getBenchmarkStats(bundle, name));
            const isComparable = results.every(res => !!res) && results.length === 2;

            if (isComparable) {
                const [base, compare] = results;
                const compareRes = compareSamples(base.samples, compare.samples);

                switch (compareRes) {
                    case 0: // Statically not differenciable
                        base.style = compare.style = COMPARE_STYLES.equal;
                        break;

                    case 1: // Base is better than compare
                        base.style = COMPARE_STYLES.better;
                        compare.style = COMPARE_STYLES.worse;
                        break;

                    case -1: // Compare is better than base
                        base.style = COMPARE_STYLES.worse;
                        compare.style = COMPARE_STYLES.better;
                        break;

                    default:
                        throw new Error(`Unexpected compare value of ${compareRes}`);
                }
            }

            return { name, bundles: results };
        });
    }

    handleOnStart() {
        this.startBenchmark();
    }

    startBenchmark() {
        this.isRunning = true;

        const { baseUrl, compareUrl } = this.config;
        getBundles(baseUrl, compareUrl).then(bundles => (
            this.bundles = bundles
        ));
    }

    handleRunnerReady({ detail, target }) {
        // TODO: Remove this once the public method on component is working
        this.readyRunner.push({
            target,
            run: detail.run
        });

        // Start the run when all the bundles are ready
        if (this.readyRunner.length === this.bundles.length) {
            setTimeout(() => this.runNext(), AUTO_START_DELAY);
        }
    }

    runNext() {
        if (!this.readyRunner.length) {
            return this.onBenchmarkEnd();
        }

        const [nextRunner, ...rest] = this.readyRunner;
        this.readyRunner = rest;

        nextRunner.run();
    }

    handleRunnerFailure({ detail: err }) {
        // TODO: handle the error gracefully
        throw err;
    }

    handleRunnerDone({ detail: results, target }) {
        // Associate the results to the right bundle
        target.bundle.results = results
        this.runNext();
    }

    onBenchmarkEnd() {
        this.isRunning = false;
        this.done = true;

        // Print results in console
        this.bundles.forEach(bundle => (
            console.log(`Results ${bundle.label}`, bundle)
        ))

        // Send results if callbackUrl is present
        if (this.config.callbackUrl) {
            postResults(this.config.callbackUrl, this.bundles);
        }
    }
}
