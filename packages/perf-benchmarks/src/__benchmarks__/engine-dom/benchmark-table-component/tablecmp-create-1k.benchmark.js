/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';

import Table from 'perf-benchmarks-components/dist/dom/benchmark/tableComponent/tableComponent.js';
import Store from 'perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';
import { benchmark, before, run, after } from '../../../utils/benchmark-framework.js';

benchmark(`benchmark-table-component/create/1k`, () => {
    let tableElement;

    before(() => {
        tableElement = createElement('benchmark-table-component', { is: Table });
        return insertComponent(tableElement);
    });

    run(() => {
        const store = new Store();
        store.run();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyComponent(tableElement);
    });
});
