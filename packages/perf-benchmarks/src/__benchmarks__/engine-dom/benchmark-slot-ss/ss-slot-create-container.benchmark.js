/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createElement } from 'lwc';

import SlotUsage from 'benchmark/slotUsageComponent';
import Store from 'benchmark/store';
import { insertComponent, destroyComponent } from 'benchmark/utils';

const NUMBER_OF_ROWS = 500;

benchmark(`benchmark-slot-ss/synthetic-shadow-create`, () => {
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
