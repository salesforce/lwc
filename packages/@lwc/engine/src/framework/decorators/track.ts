/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, toString } from '@lwc/shared';
import { componentValueObserved, componentValueMutated } from '../mutation-tracker';
import { isInvokingRender } from '../invoker';
import { getAssociatedVM } from '../vm';
import { reactiveMembrane } from '../membrane';
import { ComponentInterface } from '../component';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';

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
            const vm = getAssociatedVM(this);
            componentValueObserved(vm, key);
            return vm.cmpFields[key];
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
            if (reactiveOrAnyValue !== vm.cmpFields[key]) {
                vm.cmpFields[key] = reactiveOrAnyValue;

                componentValueMutated(vm, key);
            }
        },
        enumerable: true,
        configurable: true,
    };
}
