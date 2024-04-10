/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';

import Tree from '@lwc/perf-benchmarks-components/dist/dom/benchmark/tree/tree.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

// This test runs around 25ms on a 2019 MacBook Pro, so throttle a bit
export const cpuThrottlingRate = 2;

benchmark(`dom/tree/remove/5k`, () => {
    let treeElement;

    before(() => {
        treeElement = createElement('benchmark-tree', { is: Tree });
        // Not really 3k, but close enough: 5^5 = 3,125
        treeElement.depth = 5;
        treeElement.breadth = 5;
        return insertComponent(treeElement);
    });

    run(() => {
        treeElement.depth = 0;
    });

    after(() => {
        destroyComponent(treeElement);
    });
});
