/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert } from '@lwc/shared';
import { ComponentInterface } from './component';
import { getComponentVM } from './vm';
import { componentValueMutated, componentValueObserved } from './mutation-tracker';

export function createObservedFieldPropertyDescriptor(key: string): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a valid vm.`);
            }
            componentValueObserved(vm, key);
            return vm.cmpFields[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a valid vm.`);
            }

            if (newValue !== vm.cmpFields[key]) {
                vm.cmpFields[key] = newValue;

                componentValueMutated(vm, key);
            }
        },
        enumerable: true,
        configurable: true,
    };
}
