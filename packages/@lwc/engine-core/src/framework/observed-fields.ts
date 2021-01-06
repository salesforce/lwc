/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getAssociatedVM } from './vm';
import { componentValueMutated, componentValueObserved } from './mutation-tracker';

import type { LightningElement } from './base-lightning-element';

export function createObservedFieldPropertyDescriptor(key: string): PropertyDescriptor {
    return {
        get(this: LightningElement): any {
            const vm = getAssociatedVM(this);
            componentValueObserved(vm, key);
            return vm.cmpFields[key];
        },
        set(this: LightningElement, newValue: any) {
            const vm = getAssociatedVM(this);

            if (newValue !== vm.cmpFields[key]) {
                vm.cmpFields[key] = newValue;

                componentValueMutated(vm, key);
            }
        },
        enumerable: true,
        configurable: true,
    };
}
