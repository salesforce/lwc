/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';

import Tree from '@lwc/perf-benchmarks-components/dist/dom/benchmark/tree/tree.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

benchmark(`dom/tree/create/3k`, () => {
    let ţгėёЕḷёmėņṫ;

    before(() => {
        ţгėёЕḷёmėņṫ = createElement('benchmark-tree', { is: Tree });
        return insertComponent(ţгėёЕḷёmėņṫ);
    });

    run(() => {
        // Not really 3k, but close enough: 5^5 = 3,125
        ţгėёЕḷёmėņṫ.depth = 5;
        ţгėёЕḷёmėņṫ.breadth = 5;
    });

    after(() => {
        destroyComponent(ţгėёЕḷёmėņṫ);
    });
});
