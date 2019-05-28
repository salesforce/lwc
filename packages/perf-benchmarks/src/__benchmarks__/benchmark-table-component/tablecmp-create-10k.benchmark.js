/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';
import Table from 'benchmark/tableComponent';

import { Store } from '../../tableStore';
import { insertTableComponent, destroyTableComponent } from '../../utils';

benchmark(`benchmark-table-component/create/10k`, () => {
    let tableElement;

    before(() => {
        tableElement = createElement('benchmark-table-component', { is: Table });
        return insertTableComponent(tableElement);
    });

    run(() => {
        const store = new Store();
        store.runLots();
        tableElement.rows = store.data;
    });

    after(() => {
        destroyTableComponent(tableElement);
    });
});
