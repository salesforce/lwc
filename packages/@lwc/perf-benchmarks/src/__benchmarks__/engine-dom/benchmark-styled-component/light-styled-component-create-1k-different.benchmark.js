/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import components from '@lwc/perf-benchmarks-components/dist/dom/benchmark/light/styledComponents.js';
import { styledComponentBenchmark } from '../../../utils/styledComponentBenchmark';

const NUM_COMPONENTS = 1000;

// Create 1k components with different CSS in each component
// These are light DOM components running in native mode
styledComponentBenchmark(
    `dom/styled-component/light/create-different/1k`,
    NUM_COMPONENTS,
    components,
    { after, before, benchmark, run }
);
