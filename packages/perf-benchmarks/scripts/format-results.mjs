/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Forms the JSON results from multiple Tachometer runs and outputs a Markdown table of results.
 */

import fs from 'fs/promises';
import { markdownTable } from 'markdown-table';

function avg(a, b) {
    return (a + b) / 2;
}

function fmt(num) {
    return num.toFixed(2);
}

async function main() {
    const jsonFiles = [...process.argv].filter((_) => _.endsWith('.json'));
    const header = [
        'Benchmark',
        'Before (low)',
        'Before (high)',
        'Before (avg)',
        'After (low)',
        'After (high)',
        'After (avg)',
        'Delta (low)',
        'Delta (high)',
        'Delta (avg)',
        'Delta perc (low)',
        'Delta perc (high)',
        'Delta perc (avg)',
    ];

    const results = await Promise.all(
        jsonFiles.map(async (file) => {
            const json = JSON.parse(await fs.readFile(file, 'utf8'));
            const { benchmarks } = json;
            const { low: deltaAbsLow, high: deltaAbsHigh } = benchmarks[0].differences[1].absolute;
            const { low: deltaPercLow, high: deltaPercHigh } =
                benchmarks[0].differences[1].percentChange;
            const { low: beforeLow, high: beforeHigh } = benchmarks[1].mean;
            const { low: afterLow, high: afterHigh } = benchmarks[0].mean;
            const benchmarkName = benchmarks[0].name.replace('-this-change', '');
            return [
                benchmarkName,
                fmt(beforeLow),
                fmt(beforeHigh),
                fmt(avg(beforeLow, beforeHigh)),
                fmt(afterLow),
                fmt(afterHigh),
                fmt(avg(afterLow, afterHigh)),
                fmt(deltaAbsLow),
                fmt(deltaAbsHigh),
                fmt(avg(deltaAbsLow, deltaAbsHigh)),
                fmt(deltaPercLow / 100),
                fmt(deltaPercHigh / 100),
                fmt(avg(deltaPercLow, deltaPercHigh) / 100),
            ];
        })
    );

    console.log(markdownTable([header, ...results.sort((a, b) => (a[0] < b[0] ? -1 : 1))]));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
