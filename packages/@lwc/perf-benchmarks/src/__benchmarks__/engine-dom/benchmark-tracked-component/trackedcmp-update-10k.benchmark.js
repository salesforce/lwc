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

benchmark(`dom/tracked-component/update/10k`, () => {
    let tŗɑсķėԁⅭοmṗоṅёпṫ;
    let ṡtөṙе;

    before(async () => {
        tŗɑсķėԁⅭοmṗоṅёпṫ = createElement('benchmark-tracked-component', { is: TrackedComponent });
        await insertComponent(tŗɑсķėԁⅭοmṗоṅёпṫ);

        // Initial render
        ṡtөṙе = new Store();
        ṡtөṙе.runLots();
        tŗɑсķėԁⅭοmṗоṅёпṫ.rows = ṡtөṙе.data;
        await Promise.resolve();

        // Update data
        ṡtөṙе = new Store();
        ṡtөṙе.runLots();
    });

    run(() => {
        // Re-render
        tŗɑсķėԁⅭοmṗоṅёпṫ.rows = ṡtөṙе.data;
    });

    after(() => {
        destroyComponent(tŗɑсķėԁⅭοmṗоṅёпṫ);
    });
});
