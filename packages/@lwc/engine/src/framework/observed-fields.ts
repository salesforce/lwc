/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayReduce, isFalse } from '@lwc/shared';
import { ComponentInterface } from './component';
import { getAssociatedVM } from './vm';
import { valueMutated, valueObserved } from '../libs/mutation-tracker';

export function createObservedFieldsDescriptorMap(fields: PropertyKey[]): PropertyDescriptorMap {
    return ArrayReduce.call(
        fields,
        (acc: PropertyDescriptorMap, field) => {
            acc[field] = createObservedFieldPropertyDescriptor(field);

            return acc;
        },
        {}
    ) as PropertyDescriptorMap;
}

function createObservedFieldPropertyDescriptor(key: PropertyKey): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getAssociatedVM(this);
            valueObserved(this, key);
            return vm.cmpTrack[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getAssociatedVM(this);
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
