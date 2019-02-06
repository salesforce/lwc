/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../../shared/assert';
import { isUndefined, isFalse } from '../../shared/language';
import { isRendering, vmBeingRendered } from '../invoker';
import { valueObserved, valueMutated } from '@lwc/reactive-service';
import { getComponentVM } from '../vm';
import { reactiveMembrane } from '../membrane';
import { ComponentConstructor, ComponentInterface } from '../component';

/**
 * @track decorator to mark fields as reactive in
 * LWC Components. This function implements the internals of this
 * decorator.
 */
export default function track(
    target: ComponentConstructor,
    prop: PropertyKey,
    descriptor: PropertyDescriptor | undefined
): PropertyDescriptor;
export default function track(target: any, prop?, descriptor?): any {
    if (arguments.length === 1) {
        return reactiveMembrane.getProxy(target);
    }
    if (process.env.NODE_ENV !== 'production') {
        if (arguments.length !== 3) {
            assert.fail(
                `@track decorator can only be used with one argument to return a trackable object, or as a decorator function.`
            );
        }
        if (!isUndefined(descriptor)) {
            const { get, set, configurable, writable } = descriptor;
            assert.isTrue(
                !get && !set,
                `Compiler Error: A @track decorator can only be applied to a public field.`
            );
            assert.isTrue(
                configurable !== false,
                `Compiler Error: A @track decorator can only be applied to a configurable property.`
            );
            assert.isTrue(
                writable !== false,
                `Compiler Error: A @track decorator can only be applied to a writable property.`
            );
        }
    }
    return createTrackedPropertyDescriptor(
        target,
        prop,
        isUndefined(descriptor) ? true : descriptor.enumerable === true
    );
}

export function createTrackedPropertyDescriptor(
    Ctor: any,
    key: PropertyKey,
    enumerable: boolean
): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            valueObserved(this, key);
            return vm.cmpTrack[key];
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
            if (reactiveOrAnyValue !== vm.cmpTrack[key]) {
                vm.cmpTrack[key] = reactiveOrAnyValue;
                if (isFalse(vm.isDirty)) {
                    // perf optimization to skip this step if the track property is on a component that is already dirty
                    valueMutated(this, key);
                }
            }
        },
        enumerable,
        configurable: true,
    };
}
