import {
    quantile,
    compare,
    variance,
    median,
    medianAbsoluteDeviation
} from './stats';

const SAMPLES_THREESHOLD = 0.9;

export default class BenchmarkResult {
    static compare(resultsA, resultsB) {
        if (!resultsA || !resultsB) {
            throw new Error('compare expects 2 benchmarks results.');
        }

        return compare(resultsA.filteredSamples, resultsB.filteredSamples);
    }

    constructor(name, samples) {
        this.name = name;
        this.samples = samples;
    }

    get filteredSamples() {
        const q = quantile(this.samples, SAMPLES_THREESHOLD);
        return this.samples.filter(v => v <= q);
    }

    get stats() {
        const samples = this.filteredSamples;
        return {
            variance: variance(samples),
            median: median(samples),
            mad: medianAbsoluteDeviation(samples)
        }
    }
}

export function groupBenchmarkByName(...args) {
    const benchmarkNames = args.reduce((acc, benchmarkResults) => (
        acc.concat(benchmarkResults.map(result => result.name))
    ), []);

    const uniqueBenchmarkNames = Array.from(new Set(benchmarkNames));

    return uniqueBenchmarkNames.map(name => {
        const results = args.map(benchmarkResults => (
            benchmarkResults.find(result => result.name === name)
        ));

        return { name, results };
    })
}
