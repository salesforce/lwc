/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';

import Expression from '@lwc/perf-benchmarks-components/dist/dom/benchmark/expression/expression.js';
import Store from '@lwc/perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

benchmark(`dom/expressions`, () => {
    let expressionElement;

    before(() => {
        expressionElement = createElement('benchmark-expression', { is: Expression });
        return insertComponent(expressionElement);
    });

    run(() => {
        const store = new Store();
        store.runLots();
        expressionElement.rows = store.data;
    });

    after(() => {
        destroyComponent(expressionElement);
    });
});
