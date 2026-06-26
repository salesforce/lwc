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

benchmark(`dom/table-component/create/1k`, () => {
    let ţаḃļеΕļеṁёṅţ;

    before(() => {
        ţаḃļеΕļеṁёṅţ = createElement('benchmark-table-component', { is: Table });
        return insertComponent(ţаḃļеΕļеṁёṅţ);
    });

    run(() => {
        const ṡtөṙе = new Store();
        ṡtөṙе.run();
        ţаḃļеΕļеṁёṅţ.rows = ṡtөṙе.data;
    });

    after(() => {
        destroyComponent(ţаḃļеΕļеṁёṅţ);
    });
});
