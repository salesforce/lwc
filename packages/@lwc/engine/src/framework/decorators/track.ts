/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse } from '@lwc/shared';
import { isRendering, vmBeingRendered } from '../invoker';
import { valueObserved, valueMutated } from '../../libs/mutation-tracker';
import { getComponentVM } from '../vm';
import { reactiveMembrane } from '../membrane';
import { ComponentInterface } from '../component';

/**
 * @track decorator function to mark field value as reactive in
 * LWC Components. This function can also be invoked directly
 * with any value to obtain the trackable version of the value.
 */
export default function track(target: any, propertyKey: string, descriptor: PropertyDescriptor);
export default function track(target: any): any {
    if (arguments.length === 1) {
        return reactiveMembrane.getProxy(target);
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.fail(
            `@track decorator can only be used with one argument to return a trackable object, or as a decorator function.`
        );
    }
    throw new Error();
}

export function internalTrackDecorator(key: string): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            valueObserved(this, key);
            return vm.cmpFields[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${String(
                        key
                    )}`
                );
            }
            const reactiveOrAnyValue = reactiveMembrane.getProxy(newValue);
            if (reactiveOrAnyValue !== vm.cmpFields[key]) {
                vm.cmpFields[key] = reactiveOrAnyValue;
                if (isFalse(vm.isDirty)) {
                    // perf optimization to skip this step if the track property is on a component that is already dirty
                    valueMutated(this, key);
                }
            }
        },
        enumerable: true,
        configurable: true,
    };
}
