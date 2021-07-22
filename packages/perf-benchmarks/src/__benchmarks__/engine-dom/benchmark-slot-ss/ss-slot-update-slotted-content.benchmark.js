/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';

import SlotUsage from 'perf-benchmarks-components/dist/dom/benchmark/slotUsageComponent/slotUsageComponent.js';
import Store from 'perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';
import { benchmark, before, run, after } from '../../../utils/benchmark-framework.js';

const NUMBER_OF_ROWS = 500;

benchmark(`benchmark-slot-ss/synthetic-shadow-slot-update-slotted-content`, () => {
    let slottingComponent;
    let nextData;

    before(async () => {
        slottingComponent = createElement('benchmark-slot-usage-component', { is: SlotUsage });

        const store = new Store();

        slottingComponent.componentContent = 'Parent component slotting content to child cmp';
        slottingComponent.titleOfComponentWithSlot = 'Component that receives a slot';
        slottingComponent.rowsOfSlottedContent = store.buildData(NUMBER_OF_ROWS);
        slottingComponent.rowsOfComponentWithSlot = store.buildData(NUMBER_OF_ROWS);

        nextData = store.buildData(NUMBER_OF_ROWS);

        await insertComponent(slottingComponent);
    });

    run(() => {
        slottingComponent.rowsOfSlottedContent = nextData;
    });

    after(() => {
        destroyComponent(slottingComponent);
    });
});
