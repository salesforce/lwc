/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import StyledComponent from 'perf-benchmarks-components/dist/dom/benchmark/light/styledComponent.js';
import { styledComponentBenchmark } from '../../../utils/styledComponentBenchmark';

const NUM_COMPONENTS = 10000;

// Create 10k components with the same CSS in each component
// These are light DOM components running in native mode
styledComponentBenchmark(
    `benchmark-styled-component/create/10k/same`,
    NUM_COMPONENTS,
    StyledComponent
);
