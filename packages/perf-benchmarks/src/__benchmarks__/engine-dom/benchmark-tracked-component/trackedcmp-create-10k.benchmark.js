/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';
import TrackedComponent from 'perf-benchmarks-components/dist/dom/benchmark/trackedComponent/trackedComponent.js';
import Store from 'perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';
import { benchmark, before, run, after } from '../../../utils/benchmark-framework.js';

benchmark(`benchmark-tracked-component/create/10k`, () => {
    let trackedComponent;

    before(() => {
        trackedComponent = createElement('benchmark-tracked-component', { is: TrackedComponent });
        return insertComponent(trackedComponent);
    });

    run(() => {
        const store = new Store();
        store.runLots();
        trackedComponent.rows = store.data;
    });

    after(() => {
        destroyComponent(trackedComponent);
    });
});
