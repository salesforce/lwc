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

benchmark(`benchmark-slot-ss/synthetic-shadow-create`, () => {
    let slottingComponent;
    let data;

    before(() => {
        slottingComponent = createElement('benchmark-slot-usage-component', { is: SlotUsage });
        const store = new Store();

        data = store.buildData();
        return insertComponent(slottingComponent);
    });

    run(() => {
        slottingComponent.componentContent = "Parent component slotting content to child cmp";
        slottingComponent.slottedContent = "Content to be slotted";
        slottingComponent.rowsOfComponentWithSlot = data;
    });

    after(() => {
        destroyComponent(slottingComponent);
    });
});
