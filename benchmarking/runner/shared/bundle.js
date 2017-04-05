import fetch from 'isomorphic-fetch';

import {
    BUNDLE_FILE_NAMES,
    SAMPLES_THREESHOLD
} from './config';

import {
    mean,
    median,
    variance,
    medianAbsoluteDeviation,
    quantile,
    compare
} from './stats';

function isNonEmptyArray(arr) {
    return arr && Array.isArray(arr) && arr.length
}

function computeSampleStats(arr) {
    const q = quantile(arr, SAMPLES_THREESHOLD);
    const cleaned =  arr.filter(v => v <= q);

    return {
        arr: cleaned,
        mean: mean(cleaned),
        median: median(cleaned),
        variance: variance(cleaned),
        mad: medianAbsoluteDeviation(cleaned)
    }
}

function compareSamples(arrA, arrB) {
    return isNonEmptyArray(arrA) && isNonEmptyArray(arrB) ?
        compare(arrA, arrB) :
        0;
}

export function getBundle(label, url) {
    const infoUrl = `${url}/${BUNDLE_FILE_NAMES.info}`;

    return fetch(infoUrl).then(response => {
        if (!response.ok) {
            throw new Error(`Invalid bundle URL: ${url} (status: ${response.status})`);
        }

        return response.json();
    }).then(info => ({
        label,
        url,
        info,
        infoUrl,
        fileUrl: `${url}/${BUNDLE_FILE_NAMES.js}`,
        results: [],
    }));
}

export function bundleResultsIterator(bundles) {
    const benchmarkNames = new Set();

    for (let bundle of bundles) {
        for (let benchmark of bundle.results) {
            benchmarkNames.add(benchmark.name);
        }
    }

    const benchmarkMap = new Map();
    for (let name of benchmarkNames.values()) {
        const samples = bundles
            .map(bundle => bundle.results.find(benchmark => benchmark.name === name))
            .map(results => results && results.samples);

        const stats = samples.map(samples => (
            isNonEmptyArray(samples) ? computeSampleStats(samples) : null
        ));

        const filteredSamples = stats.map(stat => stat ? stat.arr : null);
        const compare = compareSamples(...filteredSamples);

        benchmarkMap.set(name, {
            name,
            samples,
            stats,
            compare
        });
    }

    return benchmarkMap.entries();
}
