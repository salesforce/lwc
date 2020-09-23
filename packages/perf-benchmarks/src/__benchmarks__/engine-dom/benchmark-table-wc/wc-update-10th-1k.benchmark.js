/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import Table from 'benchmark/tableComponent';
import Row from 'benchmark/tableComponentRow';

import Store from 'benchmark/store';
import { insertComponent, destroyComponent } from 'benchmark/utils';

customElements.define('benchmark-table-component', Table.CustomElementConstructor);
// the row can be optionally defined, but this benchmark always do it so we know how costly it is.
customElements.define('benchmark-table-component-row', Row.CustomElementConstructor);

benchmark(`benchmark-table-wc/update-10th/1k`, () => {
    let tableElement;
    let store;

    before(async () => {
        tableElement = document.createElement('benchmark-table-component');
        await insertComponent(tableElement);

        store = new Store();
        store.run();
        // eslint-disable-next-line require-atomic-updates
        tableElement.rows = store.data;
    });

    run(() => {
        store.update();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyComponent(tableElement);
    });
});
