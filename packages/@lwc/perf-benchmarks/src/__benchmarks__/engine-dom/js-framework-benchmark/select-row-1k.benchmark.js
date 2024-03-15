/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { runJsFrameworkBenchmark, WARMUP_COUNT } from '../../../utils/runJsFrameworkBenchmark.js';

// Throttling per https://krausest.github.io/js-framework-benchmark/2024/table_chrome_122.0.6261.69.html
export const cpuThrottlingRate = 4;

// Based on https://github.com/krausest/js-framework-benchmark/blob/6c9f43f/webdriver-ts/src/benchmarksPuppeteer.ts
// See `benchSelect()`
runJsFrameworkBenchmark(
    `dom/js-framework-benchmark/select-row/1k`,
    { benchmark, before, run, after },
    {
        async warmup({ run, select }) {
            await run();
            for (let i = 0; i < WARMUP_COUNT; i++) {
                await select(i + 5);
            }
        },
        async execute({ select }) {
            await select(2);
        },
    }
);
