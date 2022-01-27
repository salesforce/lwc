/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import Store from 'perf-benchmarks-components/dist/server/benchmark/store/store.js';

import TableClient from 'perf-benchmarks-components/dist/dom/benchmark/tableComponent/tableComponent.js';

import { benchmark, run, before } from '../../utils/benchmark-framework.js';
import { insertComponent } from '../../utils/utils';

benchmark(`benchmark-table/createElement-append/1k`, () => {
    let rows;

    before(async () => {
        const store = new Store();
        store.run();
        rows = store.data;
    });

    run(async () => {
        const tableElement = createElement('benchmark-table', { is: TableClient });
        tableElement.rows = rows;

        await insertComponent(tableElement);
    });
});
