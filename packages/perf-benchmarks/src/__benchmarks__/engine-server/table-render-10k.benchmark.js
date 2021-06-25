/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderComponent } from '@lwc/engine-server';

import Table from 'perf-benchmarks-components/dist/server/benchmark/cardComponent/cardComponent.js';
import Store from 'perf-benchmarks-components/dist/server/benchmark/store/store.js';

benchmark(`benchmark-table/render/10k`, () => {
    run(() => {
        const store = new Store();
        store.runLots();

        renderComponent('benchmark-table', Table, {
            rows: store.data,
        });
    });
});
