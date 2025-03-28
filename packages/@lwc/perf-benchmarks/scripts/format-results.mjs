/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Forms the JSON results from multiple Tachometer runs and outputs a Markdown table of results.
 */

import fsp from 'node:fs/promises';
import path from 'node:path';
import { markdownTable } from 'markdown-table';

const OUT_DIR = path.resolve(import.meta.dirname, '../dist/__benchmarks__');

function avg(a, b) {
    return (a + b) / 2;
}

function fmt(num) {
    return num.toFixed(2);
}

function htmlTable(head, body) {
    const thead = `<tr>${head.map((txt) => `<th>${txt}</th>`).join('')}</tr>`;
    const tbody = body
        .map((row) => {
            return `<tr>${row.map((txt) => `<td>${txt}</td>`).join('')}</tr>`;
        })
        .join('');
    return `<!DOCTYPE html>
    <html><body><table>
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
    </table></body></html>`;
}

async function saveResult(filename, content) {
    return await fsp.writeFile(path.join(OUT_DIR, filename), content, 'utf8');
}

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
        const json = JSON.parse(await fsp.readFile(file, 'utf8'));
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

// Sort by test name
results.sort((a, b) => a[0].localeCompare(b[0]));

const md = markdownTable([header, ...results]);
console.log(md);
await saveResult('results.md', md);
await saveResult('results.html', htmlTable(header, results));
