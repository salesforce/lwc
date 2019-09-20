/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import features from '@lwc/features';
import { assert, isFalse, isFunction, isTrue, isUndefined, toString } from '@lwc/shared';
import { logError } from '../../shared/logger';
import { isInvokingRender, isBeingConstructed } from '../invoker';
import {
    componentValueObserved,
    componentValueMutated,
    ReactiveObserver,
} from '../mutation-tracker';
import { ComponentInterface } from '../component';
import { getAssociatedVM, rerenderVM } from '../vm';
import { addCallbackToNextTick } from '../utils';
import { isUpdatingTemplate, getVMBeingRendered } from '../template';

/**
 * @api decorator to mark public fields and public methods in
 * LWC Components. This function implements the internals of this
 * decorator.
 */
export default function api(target: any, propertyKey: string, descriptor: PropertyDescriptor);
export default function api() {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail(`@api decorator can only be used as a decorator function.`);
    }
    throw new Error();
}

export function createPublicPropertyDescriptor(key: string): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getAssociatedVM(this);
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    const name = vm.elm.constructor.name;
                    logError(
                        `\`${name}\` constructor can’t read the value of property \`${toString(
                            key
                        )}\` because the owner component hasn’t set the value yet. Instead, use the \`${name}\` constructor to set a default value for the property.`,
                        vm
                    );
                }
                return;
            }
            componentValueObserved(vm, key);
            return vm.cmpProps[key];
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
            vm.cmpProps[key] = newValue;

            componentValueMutated(vm, key);
        },
        enumerable: true,
        configurable: true,
    };
}

class AccessorReactiveObserver extends ReactiveObserver {
    private value: any;
    private debouncing: boolean = false;
    constructor(vm, set) {
        super(() => {
            if (isFalse(this.debouncing)) {
                this.debouncing = true;
                addCallbackToNextTick(() => {
                    if (isTrue(this.debouncing)) {
                        const { value } = this;
                        const { isDirty: dirtyStateBeforeSetterCall, component, idx } = vm;
                        set.call(component, value);
                        // de-bouncing after the call to the original setter to prevent
                        // infinity loop if the setter itself is mutating things that
                        // were accessed during the previous invocation.
                        this.debouncing = false;
                        if (isTrue(vm.isDirty) && isFalse(dirtyStateBeforeSetterCall) && idx > 0) {
                            // immediate rehydration due to a setter driven mutation, otherwise
                            // the component will get rendered on the second tick, which it is not
                            // desirable.
                            rerenderVM(vm);
                        }
                    }
                });
            }
        });
    }
    reset(value?: any) {
        super.reset();
        this.debouncing = false;
        if (arguments.length > 0) {
            this.value = value;
        }
    }
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
        get(this: ComponentInterface): any {
            if (process.env.NODE_ENV !== 'production') {
                // Assert that the this value is an actual Component with an associated VM.
                getAssociatedVM(this);
            }
            return get.call(this);
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
            if (set) {
                if (features.ENABLE_REACTIVE_SETTER) {
                    let ro = vm.oar[key as any] as AccessorReactiveObserver;
                    if (isUndefined(ro)) {
                        ro = vm.oar[key as any] = new AccessorReactiveObserver(vm, set);
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
