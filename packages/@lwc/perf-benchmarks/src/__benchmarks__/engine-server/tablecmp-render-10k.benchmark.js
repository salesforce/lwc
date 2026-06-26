/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { renderComponent } from '@lwc/engine-server';

import Table from '@lwc/perf-benchmarks-components/dist/server/benchmark/tableComponent/tableComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/server/benchmark/store/store.js';

benchmark(`server/table-component/render/10k`, () => {
    run(() => {
        const ṡtөṙе = new Store();
        ṡtөṙе.runLots();

        renderComponent('benchmark-table', Table, {
            rows: ṡtөṙе.data,
        });
    });
});
