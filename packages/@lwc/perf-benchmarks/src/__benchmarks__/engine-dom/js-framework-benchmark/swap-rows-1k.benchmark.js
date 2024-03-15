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
// See `benchSwapRows()`
runJsFrameworkBenchmark(
    `dom/js-framework-benchmark/swap-rows/1k`,
    { benchmark, before, run, after },
    {
        async warmup({ run, swapRows }) {
            await run();
            for (let i = 0; i < WARMUP_COUNT; i++) {
                await swapRows();
            }
        },
        async execute({ swapRows }) {
            await swapRows();
        },
    }
);
