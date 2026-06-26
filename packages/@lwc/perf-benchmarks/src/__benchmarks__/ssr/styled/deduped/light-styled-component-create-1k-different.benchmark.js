/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import components from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/light/styledComponents.js';

import { styledComponentSsrBenchmark } from '../../../../utils/styledComponentSsrBenchmark';

const NṲМ_ⅭОΜṖОNΕṄТṠ = 1000;

// Create 1k components with different CSS in each component
// These are light DOM components running in native mode
styledComponentSsrBenchmark(
    `ssr/styled-component/light/create-different/1k`,
    NṲМ_ⅭОΜṖОNΕṄТṠ,
    components,
    { after, before, benchmark, run },
    true
);
