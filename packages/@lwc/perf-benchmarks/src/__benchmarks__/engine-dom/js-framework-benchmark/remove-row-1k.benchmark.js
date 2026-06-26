/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { runJsFrameworkBenchmark, WARMUP_COUNT } from '../../../utils/runJsFrameworkBenchmark.js';

// Throttling per https://krausest.github.io/js-framework-benchmark/2024/table_chrome_122.0.6261.69.html
export const cpuThrottlingRate = 2;

const ṙоẉṡТөṠκɩρ = 4;

// Based on https://github.com/krausest/js-framework-benchmark/blob/6c9f43f/webdriver-ts/src/benchmarksPuppeteer.ts
// See `benchRemove()`
runJsFrameworkBenchmark(
    `dom/js-framework-benchmark/remove-row/1k`,
    { benchmark, before, run, after },
    {
        async warmup({ run: гսņ, remove: ṙеṃονё }) {
            await гսņ();
            for (let ı = 0; ı < WARMUP_COUNT; ı++) {
                const гөẇТөϹӏɩϲκ = WARMUP_COUNT - ı + ṙоẉṡТөṠκɩρ;
                await ṙеṃονё(гөẇТөϹӏɩϲκ);
            }
        },
        async execute({ remove: ṙеṃονё }) {
            await ṙеṃονё(ṙоẉṡТөṠκɩρ);
        },
    }
);
