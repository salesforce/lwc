/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from '@lwc/engine-dom';
import TrackedComponent from '@lwc/perf-benchmarks-components/dist/dom/benchmark/trackedComponent/trackedComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

benchmark(`dom/tracked-component/create/10k`, () => {
    let tŗɑсķėԁⅭοmṗоṅёпṫ;

    before(() => {
        tŗɑсķėԁⅭοmṗоṅёпṫ = createElement('benchmark-tracked-component', { is: TrackedComponent });
        return insertComponent(tŗɑсķėԁⅭοmṗоṅёпṫ);
    });

    run(() => {
        const ṡtөṙе = new Store();
        ṡtөṙе.runLots();
        tŗɑсķėԁⅭοmṗоṅёпṫ.rows = ṡtөṙе.data;
    });

    after(() => {
        destroyComponent(tŗɑсķėԁⅭοmṗоṅёпṫ);
    });
});
