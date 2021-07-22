/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import Table from 'perf-benchmarks-components/dist/dom/benchmark/tableComponent/tableComponent.js';
import Row from 'perf-benchmarks-components/dist/dom/benchmark/tableComponentRow/tableComponentRow.js';

import Store from 'perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';
import { benchmark, before, run, after } from '../../../utils/benchmark-framework.js';

customElements.define('benchmark-table-component', Table.CustomElementConstructor);
// the row can be optionally defined, but this benchmark always do it so we know how costly it is.
customElements.define('benchmark-table-component-row', Row.CustomElementConstructor);

benchmark(`benchmark-table-wc/create/10k`, () => {
    let tableElement;

    before(() => {
        tableElement = document.createElement('benchmark-table-component');
        return insertComponent(tableElement);
    });

    run(() => {
        const store = new Store();
        store.runLots();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyComponent(tableElement);
    });
});
