import {
    quantile,
    median,
    medianAbsoluteDeviation
} from '../../../../shared/stats';

const DEFAULT_MIN_SAMPLE = 30;
const DEFAULT_MAX_DURATION = 5 * 1000;

function queryString() {
    const search = document.location.search.slice(1);
    const params = {};

    for (let param of search.split('&')) {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    }

   return params;
}

export function getConfigFromQueryString() {
    const {
        base,
        compare,
        grep,
        minSampleCount,
        maxDuration,
        start,
        callbackUrl,
    } = queryString();

    return {
        baseUrl: base,
        compareUrl: compare,
        minSampleCount: minSampleCount ? parseInt(minSampleCount) : DEFAULT_MIN_SAMPLE,
        maxDuration: maxDuration ? parseInt(maxDuration) : DEFAULT_MAX_DURATION,
        start: !!start,
        grep,
        callbackUrl,
    }
}

function isAbsoluteUrl(path) {
    return path.startsWith('http://') || path.startsWith('https://');
}

function buildUrl(path) {
    return isAbsoluteUrl(path) ?
        new URL(path) :
        new URL(path, window.location);
}

function getBundleInfo(bundleDirUrl) {
    const infoUrl = buildUrl(`${bundleDirUrl}/info.json`);

    return fetch(infoUrl).then(response => {
        if (!response.ok) {
            throw new Error(`Error while fetching bundle info ${infoUrl}`)
        }

        return response.json();
    });
}

export function getBundles(base, compare) {
    const bundles = [{
        label: 'base',
        url: buildUrl(base),
        results: [],
    }];

    if (compare) {
        bundles.push({
            label: 'compare',
            url: buildUrl(compare),
            results: [],
        })
    }

    return Promise.all(
        bundles.map(bundle => (
            getBundleInfo(bundle.url).then(info => (
                Object.assign(bundle, { info })
            ))
        )
    ));
}

export function postResults(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export function listBenchmarks(bundle) {
    return bundle.results.map(benchmark => (
        benchmark.name
    ));
}

export function getBenchmarkStats(bundle, name) {
    // Find matching benchmark
    const benchmarkResult = bundle.results.find(benchmark => (
        benchmark.name === name
    ));

    // Return undefined if not present
    if (!benchmarkResult) {
        return;
    }

    // Clean up all the values higher than the 9th decile.
    // This would remove most of the sample outliers due to garbage collection
    const q = quantile(benchmarkResult.samples, 0.90);
    const cleanedSamples = benchmarkResult.samples.filter(v => v < q);

    return {
        samples: cleanedSamples,
        median: median(cleanedSamples).toFixed(3),
        mad: medianAbsoluteDeviation(cleanedSamples).toFixed(3)
    }
}
