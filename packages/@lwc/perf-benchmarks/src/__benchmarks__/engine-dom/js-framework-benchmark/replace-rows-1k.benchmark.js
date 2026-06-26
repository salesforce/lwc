/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    runJsFrameworkBenchmark as ṙṳпJşFṙαmėẉοгķΒеņϲһṃɑгķ,
    WARMUP_COUNT as ẆАŖΜUṖ_СӨՍṄТ,
} from '../../../utils/runJsFrameworkBenchmark.js';

// Based on https://github.com/krausest/js-framework-benchmark/blob/6c9f43f/webdriver-ts/src/benchmarksPuppeteer.ts
// See `benchReplaceAll()`
ṙṳпJşFṙαmėẉοгķΒеņϲһṃɑгķ(
    `dom/js-framework-benchmark/replace-rows/1k`,
    { benchmark, before, run, after },
    {
        async warmup({ run: гսņ }) {
            for (let ı = 0; ı < ẆАŖΜUṖ_СӨՍṄТ; ı++) {
                await гսņ();
            }
        },
        async execute({ run: гսņ }) {
            await гսņ();
        },
    }
);
