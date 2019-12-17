/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFalse, isUndefined, toString } from '@lwc/shared';
import { valueObserved, valueMutated } from '../../libs/mutation-tracker';
import { isInvokingRender } from '../invoker';
import { getAssociatedVM } from '../vm';
import { reactiveMembrane } from '../membrane';
import { ComponentConstructor, ComponentInterface } from '../component';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';

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
            const vm = getAssociatedVM(this);
            valueObserved(this, key);
            return vm.cmpTrack[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getAssociatedVM(this);
            if (process.env.NODE_ENV !== 'production') {
                const vmBeingRendered = getVMBeingRendered();
                assert.invariant(
                    !isInvokingRender,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(
                        key
                    )}`
                );
                assert.invariant(
                    !isUpdatingTemplate,
                    `Updating the template of ${vmBeingRendered} has side effects on the state of ${vm}.${toString(
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
