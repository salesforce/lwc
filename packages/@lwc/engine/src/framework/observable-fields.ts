/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ComponentConstructor, ComponentInterface } from './component';
import { getComponentVM } from './vm';
import assert from '../shared/assert';
import { valueMutated, valueObserved } from '../libs/mutation-tracker';
import { isRendering, vmBeingRendered } from './invoker';
import { defineProperty, isFalse } from '../shared/language';

export function observeFields(Ctor: ComponentConstructor, fields: string[] | undefined) {
    if (fields) {
        const proto = Ctor.prototype;

        for (let i = 0, len = fields.length; i < len; i += 1) {
            const fieldDescriptor = createObservedPropertyDescriptor(fields[i]);
            defineProperty(proto, fields[i], fieldDescriptor);
        }
    }
}

function createObservedPropertyDescriptor(key: PropertyKey): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a valid vm.`);
            }
            valueObserved(this, key);
            return vm.cmpFields[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a valid vm.`);
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${String(
                        key
                    )}`
                );
            }

            if (newValue !== vm.cmpFields[key]) {
                vm.cmpFields[key] = newValue;
                if (isFalse(vm.isDirty)) {
                    valueMutated(this, key);
                }
            }
        },
        enumerable: true,
        configurable: true,
    };
}
