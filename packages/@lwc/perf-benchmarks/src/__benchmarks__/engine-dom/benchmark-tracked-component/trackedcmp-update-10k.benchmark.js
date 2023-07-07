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
    let trackedComponent;
    let store;

    before(async () => {
        trackedComponent = createElement('benchmark-tracked-component', { is: TrackedComponent });
        await insertComponent(trackedComponent);

        // Initial render
        store = new Store();
        store.runLots();
        trackedComponent.rows = store.data;
        await Promise.resolve();

        // Update data
        store = new Store();
        store.runLots();
    });

    run(() => {
        // Re-render
        trackedComponent.rows = store.data;
    });

    after(() => {
        destroyComponent(trackedComponent);
    });
});
