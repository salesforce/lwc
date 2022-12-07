/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import '@lwc/synthetic-shadow';
import { createElement } from '@lwc/engine-dom';

import SlotUsage from '@lwc/perf-benchmarks-components/dist/dom/benchmark/slotUsageComponent/slotUsageComponent.js';
import Store from '@lwc/perf-benchmarks-components/dist/dom/benchmark/store/store.js';
import { insertComponent, destroyComponent } from '../../../utils/utils.js';

const NUMBER_OF_ROWS = 5000;

benchmark(`dom/slot/synthetic-shadow/create/5k`, () => {
    let slottingComponent;
    let rowsOfComponentWithSlot;
    let rowsOfSlottedContent;

    before(() => {
        slottingComponent = createElement('benchmark-slot-usage-component', { is: SlotUsage });
        const store = new Store();

        rowsOfComponentWithSlot = store.buildData(NUMBER_OF_ROWS);
        rowsOfSlottedContent = store.buildData(NUMBER_OF_ROWS);
        return insertComponent(slottingComponent);
    });

    run(() => {
        slottingComponent.componentContent = 'Parent component slotting content to child cmp';
        slottingComponent.rowsOfSlottedContent = rowsOfSlottedContent;
        slottingComponent.titleOfComponentWithSlot = 'Component that receives a slot';
        slottingComponent.rowsOfComponentWithSlot = rowsOfComponentWithSlot;
    });

    after(() => {
        destroyComponent(slottingComponent);
    });
});
