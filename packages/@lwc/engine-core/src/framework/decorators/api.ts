/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import features from '@lwc/features';
import { assert, isFunction, isUndefined, toString } from '@lwc/shared';
import { logError } from '../../shared/logger';
import { isInvokingRender, isBeingConstructed } from '../invoker';
import { componentValueObserved, componentValueMutated } from '../mutation-tracker';
import { LightningElement } from '../base-lightning-element';
import { getAssociatedVM } from '../vm';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';
import { createAccessorReactiveObserver } from '../accessor-reactive-observer';

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
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.invariant(
                isFunction(get),
                `Invalid compiler output for public accessor ${toString(key)} decorated with @api`
            );
        }
        throw new Error();
    }
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
            if (set) {
                if (features.ENABLE_REACTIVE_SETTER) {
                    let ro = vm.oar[key as any];
                    if (isUndefined(ro)) {
                        ro = vm.oar[key as any] = createAccessorReactiveObserver(vm, set);
                    }
                    // every time we invoke this setter from outside (through this wrapper setter)
                    // we should reset the value and then debounce just in case there is a pending
                    // invocation the next tick that is not longer relevant since the value is changing
                    // from outside.
                    ro.reset(newValue);
                    ro.observe(() => {
                        set.call(this, newValue);
                    });
                } else {
                    set.call(this, newValue);
                }
            } else if (process.env.NODE_ENV !== 'production') {
                assert.fail(
                    `Invalid attempt to set a new value for property ${toString(
                        key
                    )} of ${vm} that does not has a setter decorated with @api.`
                );
            }
        },
        enumerable,
        configurable,
    };
}
