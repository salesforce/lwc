/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import components from 'perf-benchmarks-components/dist/dom/benchmark/shadow/styledComponents.js';
import { styledComponentBenchmark } from '../../../utils/styledComponentBenchmark';

// Create 1k components with different CSS in each component
// These components are native, but run with synthetic shadow loaded (mixed mode)
window.lwcRuntimeFlags.ENABLE_MIXED_SHADOW_MODE = true;
for (const component of components) {
    component.shadowSupportMode = 'any';
}
styledComponentBenchmark(`ss-benchmark-styled-component/create/1k/different`, components);
