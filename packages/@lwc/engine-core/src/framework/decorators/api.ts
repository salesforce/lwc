/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFunction, isNull, toString } from '@lwc/shared';
import { logError } from '../../shared/logger';
import { isInvokingRender, isBeingConstructed } from '../invoker';
import { componentValueObserved, componentValueMutated } from '../mutation-tracker';
import { LightningElement } from '../base-lightning-element';
import { getAssociatedVM } from '../vm';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';

/**
 * @api decorator to mark public fields and public methods in
 * LWC Components. This function implements the internals of this
 * decorator.
 */
export default function api(target: any, propertyKey: string, descriptor: PropertyDescriptor): void;
export default function api() {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail(`@api decorator can only be used as a decorator function.`);
    }
    throw new Error();
}

export function createPublicPropertyDescriptor(key: string): PropertyDescriptor {
    return {
        get(this: LightningElement): any {
            const vm = getAssociatedVM(this);
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    logError(
                        `Can’t read the value of property \`${toString(
                            key
                        )}\` from the constructor because the owner component hasn’t set the value yet. Instead, use the constructor to set a default value for the property.`,
                        vm
                    );
                }
                return;
            }
            componentValueObserved(vm, key);
            return vm.cmpProps[key];
        },
        set(this: LightningElement, newValue: any) {
            const vm = getAssociatedVM(this);
            if (process.env.NODE_ENV !== 'production') {
                const vmBeingRendered = getVMBeingRendered();
                if (isInvokingRender) {
                    logError(
                        `render() method has side effects on the state of property "${toString(
                            key
                        )}"`,
                        isNull(vmBeingRendered) ? vm : vmBeingRendered
                    );
                }
                if (isUpdatingTemplate) {
                    logError(
                        `Updating the template has side effects on the state of property "${toString(
                            key
                        )}"`,
                        isNull(vmBeingRendered) ? vm : vmBeingRendered
                    );
                }
            }
            vm.cmpProps[key] = newValue;

            componentValueMutated(vm, key);
        },
        enumerable: true,
        configurable: true,
    };
}

export function createPublicAccessorDescriptor(
    key: PropertyKey,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const { get, set, enumerable, configurable } = descriptor;
    assert.invariant(
        isFunction(get),
        `Invalid public accessor ${toString(
            key
        )} decorated with @api. The property is missing a getter.`
    );
    return {
        get(this: LightningElement): any {
            if (process.env.NODE_ENV !== 'production') {
                // Assert that the this value is an actual Component with an associated VM.
                getAssociatedVM(this);
            }
            return get.call(this);
        },
        set(this: LightningElement, newValue: any) {
            const vm = getAssociatedVM(this);
            if (process.env.NODE_ENV !== 'production') {
                const vmBeingRendered = getVMBeingRendered();
                if (isInvokingRender) {
                    logError(
                        `render() method has side effects on the state of property "${toString(
                            key
                        )}"`,
                        isNull(vmBeingRendered) ? vm : vmBeingRendered
                    );
                }
                if (isUpdatingTemplate) {
                    logError(
                        `Updating the template has side effects on the state of property "${toString(
                            key
                        )}"`,
                        isNull(vmBeingRendered) ? vm : vmBeingRendered
                    );
                }
            }
            if (set) {
                set.call(this, newValue);
            } else if (process.env.NODE_ENV !== 'production') {
                logError(
                    `Invalid attempt to set a new value for property "${toString(
                        key
                    )}" that does not has a setter decorated with @api.`,
                    vm
                );
            }
        },
        enumerable,
        configurable,
    };
}
