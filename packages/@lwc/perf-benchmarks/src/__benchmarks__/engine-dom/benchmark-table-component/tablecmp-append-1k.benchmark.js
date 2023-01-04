/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';

import Table from '@lwc/perf-benchmarks-components/dist/dom/benchmark/tableComponent/tableComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

benchmark(`dom/table-component/append/1k`, () => {
    let tableElement;
    let store;

    before(async () => {
        tableElement = createElement('benchmark-table-component', { is: Table });
        await insertComponent(tableElement);

        store = new Store();
        store.run();
        // eslint-disable-next-line require-atomic-updates
        tableElement.rows = store.data;
    });

    run(() => {
        store.add();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyComponent(tableElement);
    });
});
