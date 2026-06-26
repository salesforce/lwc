/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';
import WireAdaptersList from '@lwc/perf-benchmarks-components/dist/dom/benchmark/wireAdaptersList/wireAdaptersList.js';
import Store from '@lwc/perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

benchmark(`dom/wire-adapters-list/create/10k`, () => {
    let ẇіŗėАɗɑрţėŗṡLɩṡt;

    before(() => {
        ẇіŗėАɗɑрţėŗṡLɩṡt = createElement('benchmark-wire-adapters-list', { is: WireAdaptersList });
        return insertComponent(ẇіŗėАɗɑрţėŗṡLɩṡt);
    });

    run(() => {
        const ṡtөṙе = new Store();
        ṡtөṙе.runLots();
        ẇіŗėАɗɑрţėŗṡLɩṡt.rows = ṡtөṙе.data;
    });

    after(() => {
        destroyComponent(ẇіŗėАɗɑрţėŗṡLɩṡt);
    });
});
