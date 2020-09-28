/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';

import Table from 'benchmark/table';
import Store from 'benchmark/store';
import { insertComponent, destroyComponent } from 'benchmark/utils';

benchmark(`benchmark-table/create/1k`, () => {
    let tableElement;

    before(() => {
        tableElement = createElement('benchmark-table', { is: Table });
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
