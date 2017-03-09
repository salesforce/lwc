export function sort(arr) {
    return [...arr].sort((a, b) => a - b);
}

export function quantile(arr, p) {
    const sorted = sort(arr);
    const index = Math.floor(arr.length * p);

    return sorted[index];
}

export function mean(arr) {
    return arr.reduce((acc, v) => acc + v, 0) / arr.length;
}

export function variance(arr) {
    const avg = mean(arr);
    return mean(arr.map(v => Math.pow(v - avg, 2)));
}

export function median(arr) {
    if (!arr.length) {
        return null;
    }

    const sorted = sort(arr);
    const middle = Math.ceil(arr.length / 2);
    return arr.length % 2 ?
        sorted[middle] :
        ((sorted[middle] + sorted[middle + 1]) / 2);
}

export function medianAbsoluteDeviation(arr) {
    const med = median(arr);
    return median(arr.map(x => Math.abs(x - med)))
}

// From https://github.com/bestiejs/benchmark.js/blob/master/benchmark.js#L1391
export function compareSamples(sample1, sample2) {
    var zStat,
        size1 = sample1.length,
        size2 = sample2.length,
        u1 = getU(sample1, sample2),
        u2 = getU(sample2, sample1),
        u = Math.min(u1, u2);

    function getScore(xA, sampleB) {
        return sampleB.reduce(function(total, xB) {
            return total + (xB > xA ? 0 : xB < xA ? 1 : 0.5);
        }, 0);
    }

    function getU(sampleA, sampleB) {
        return sampleA.reduce(function(total, xA) {
            return total + getScore(xA, sampleB);
        }, 0);
    }

    function getZ(u) {
        return (u - ((size1 * size2) / 2)) / Math.sqrt((size1 * size2 * (size1 + size2 + 1)) / 12);
    }

    if (size1 + size2 < 30) {
        console.warn(`Samples size should be at least greater than 30 to use the z Test`);
        return 0;
    }

    // Reject the null hypothesis the two samples come from the
    // same population (i.e. have the same median) if the z-stat is greater than 1.96 or less than -1.96
    // http://www.statisticslectures.com/topics/mannwhitneyu/
    zStat = getZ(u);
    return Math.abs(zStat) > 1.96 ? (u == u1 ? 1 : -1) : 0;
}
