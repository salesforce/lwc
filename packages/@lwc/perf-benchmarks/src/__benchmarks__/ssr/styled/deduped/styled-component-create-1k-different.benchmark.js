/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import components from '@lwc/perf-benchmarks-components/dist/ssr/benchmark/shadow/styledComponents.js';

import { styledComponentSsrBenchmark } from '../../../../utils/styledComponentSsrBenchmark';

const NUM_COMPONENTS = 1000;

// Create 1k components with different CSS in each component
styledComponentSsrBenchmark(
    `ssr/styled-component/shadow/create-different/1k`,
    NUM_COMPONENTS,
    components,
    { after, before, benchmark, run },
    true
);
