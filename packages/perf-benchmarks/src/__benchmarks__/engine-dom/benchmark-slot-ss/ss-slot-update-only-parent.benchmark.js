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

benchmark(`benchmark-slot-ss/synthetic-shadow-slot-update-only-parent`, () => {
    let slottingComponent;

    before(async () => {
        slottingComponent = createElement('benchmark-slot-usage-component', { is: SlotUsage });

        const store = new Store();

        slottingComponent.componentContent = "Parent component slotting content to child cmp";
        slottingComponent.slottedContent = "Content to be slotted";
        slottingComponent.rowsOfComponentWithSlot = store.buildData();

        await insertComponent(slottingComponent);


    });

    run(() => {
        slottingComponent.componentContent = "[modified] Parent component slotting content to child cmp";
    });

    after(() => {
        destroyComponent(slottingComponent);
    });
});
