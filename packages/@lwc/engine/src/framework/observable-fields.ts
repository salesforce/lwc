/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ComponentInterface } from './component';
import { getComponentVM } from './vm';
import assert from '../shared/assert';
import { valueMutated, valueObserved } from '../libs/mutation-tracker';
import { isRendering, vmBeingRendered } from './invoker';
import { isFalse } from '../shared/language';

export function createObservableFieldsDescriptorMap(fields: PropertyKey[]): PropertyDescriptorMap {
    return fields.reduce((acc, field) => {
        acc[field] = createObservableFieldPropertyDescriptor(field);

        return acc;
    }, {});
}

function createObservableFieldPropertyDescriptor(key: PropertyKey): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a valid vm.`);
            }
            valueObserved(this, key);
            return vm.cmpTrack[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a valid vm.`);
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of "${String(
                        key
                    )}" field`
                );
            }

            if (newValue !== vm.cmpTrack[key]) {
                vm.cmpTrack[key] = newValue;
                if (isFalse(vm.isDirty)) {
                    valueMutated(this, key);
                }
            }
        },
        enumerable: true,
        configurable: true,
    };
}
