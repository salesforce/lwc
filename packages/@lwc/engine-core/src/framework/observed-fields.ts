/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement } from './base-lightning-element';
import { getAssociatedVM } from './vm';
import { componentValueObserved } from './mutation-tracker';
import { updateComponentValue } from './update-component-value';

export function createObservedFieldPropertyDescriptor(key: string): PropertyDescriptor {
    return {
        get(this: LightningElement): any {
            const vm = getAssociatedVM(this);
            componentValueObserved(vm, key);
            return vm.cmpFields[key];
        },
        set(this: LightningElement, newValue: any) {
            const vm = getAssociatedVM(this);

            updateComponentValue(vm, key, newValue);
        },
        enumerable: true,
        configurable: true,
    };
}
