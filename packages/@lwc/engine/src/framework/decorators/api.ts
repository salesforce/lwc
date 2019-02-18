/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../../shared/assert';
import { isRendering, vmBeingRendered, isBeingConstructed } from '../invoker';
import { isObject, isNull, isTrue, toString } from '../../shared/language';
import { observeMutation, notifyMutation } from '../watcher';
import { ComponentInterface, ComponentConstructor } from '../component';
import { VM, getComponentVM } from '../vm';
import { isUndefined, isFunction } from '../../shared/language';
import { reactiveMembrane } from '../membrane';
import { getDecoratorsRegisteredMeta } from './register';

export default function api(
    target: ComponentConstructor,
    propName: PropertyKey,
    descriptor: PropertyDescriptor | undefined,
): PropertyDescriptor {
    if (process.env.NODE_ENV !== 'production') {
        if (arguments.length !== 3) {
            assert.fail(`@api decorator can only be used as a decorator function.`);
        }
    }
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            !descriptor || (isFunction(descriptor.get) || isFunction(descriptor.set)),
            `Invalid property ${toString(
                propName,
            )} definition in ${target}, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`,
        );
        if (isObject(descriptor) && isFunction(descriptor.set)) {
            assert.isTrue(
                isObject(descriptor) && isFunction(descriptor.get),
                `Missing getter for property ${toString(
                    propName,
                )} decorated with @api in ${target}. You cannot have a setter without the corresponding getter.`,
            );
        }
    }
    const meta = getDecoratorsRegisteredMeta(target);
    // initializing getters and setters for each public prop on the target prototype
    if (isObject(descriptor) && (isFunction(descriptor.get) || isFunction(descriptor.set))) {
        // if it is configured as an accessor it must have a descriptor
        // @ts-ignore it must always be set before calling this method
        meta.props[propName].config = isFunction(descriptor.set) ? 3 : 1;
        return createPublicAccessorDescriptor(target, propName, descriptor);
    } else {
        // @ts-ignore it must always be set before calling this method
        meta.props[propName].config = 0;
        return createPublicPropertyDescriptor(target, propName, descriptor);
    }
}

let vmBeingUpdated: VM | null = null;
export function prepareForPropUpdate(vm: VM) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
    }
    vmBeingUpdated = vm;
}

function createPublicPropertyDescriptor(
    proto: ComponentConstructor,
    key: PropertyKey,
    descriptor: PropertyDescriptor | undefined,
): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    assert.logError(
                        `${vm} constructor should not read the value of property "${toString(
                            key,
                        )}". The owner component has not yet set the value. Instead use the constructor to set default values for properties.`,
                        vm.elm,
                    );
                }
                return;
            }
            observeMutation(this, key);
            return vm.cmpProps[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(key)}`,
                );
            }
            if (isTrue(vm.isRoot) || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                if (process.env.NODE_ENV !== 'production') {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    const isObservable = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(
                            `Assigning a non-reactive value ${newValue} to member property ${toString(
                                key,
                            )} of ${vm} is not common because mutations on that value cannot be observed.`,
                            vm.elm,
                        );
                    }
                }
            }
            if (process.env.NODE_ENV !== 'production') {
                if (vmBeingUpdated !== vm) {
                    // logic for setting new properties of the element directly from the DOM
                    // is only recommended for root elements created via createElement()
                    assert.logWarning(
                        `If property ${toString(
                            key,
                        )} decorated with @api in ${vm} is used in the template, the value ${toString(
                            newValue,
                        )} set manually may be overridden by the template, consider binding the property only in the template.`,
                        vm.elm,
                    );
                }
            }
            vmBeingUpdated = null; // releasing the lock
            // not need to wrap or check the value since that is happening somewhere else
            vm.cmpProps[key] = reactiveMembrane.getReadOnlyProxy(newValue);

            // avoid notification of observability while constructing the instance
            if (vm.idx > 0) {
                // perf optimization to skip this step if not in the DOM
                notifyMutation(this, key);
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
    };
}

function createPublicAccessorDescriptor(
    Ctor: ComponentConstructor,
    key: PropertyKey,
    descriptor: PropertyDescriptor,
): PropertyDescriptor {
    const { get, set, enumerable } = descriptor;
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Invalid attempt to create public property descriptor ${toString(
                    key,
                )} in ${Ctor}. It is missing the getter declaration with @api get ${toString(key)}() {} syntax.`,
            );
        }
        throw new TypeError();
    }
    return {
        get(this: ComponentInterface): any {
            if (process.env.NODE_ENV !== 'production') {
                const vm = getComponentVM(this);
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            return get.call(this);
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(key)}`,
                );
            }
            if (vm.isRoot || isBeingConstructed(vm)) {
                vmBeingUpdated = vm;
                if (process.env.NODE_ENV !== 'production') {
                    // reactiveMembrane.getProxy(newValue) will return a different value (proxy)
                    // Then newValue if newValue is observable (plain object or array)
                    const isObservable = reactiveMembrane.getProxy(newValue) !== newValue;
                    if (!isObservable && !isNull(newValue) && isObject(newValue)) {
                        assert.logWarning(
                            `Assigning a non-reactive value ${newValue} to member property ${toString(
                                key,
                            )} of ${vm} is not common because mutations on that value cannot be observed.`,
                            vm.elm,
                        );
                    }
                }
            }
            if (process.env.NODE_ENV !== 'production') {
                if (vmBeingUpdated !== vm) {
                    // logic for setting new properties of the element directly from the DOM
                    // is only recommended for root elements created via createElement()
                    assert.logWarning(
                        `If property ${toString(
                            key,
                        )} decorated with @api in ${vm} is used in the template, the value ${toString(
                            newValue,
                        )} set manually may be overridden by the template, consider binding the property only in the template.`,
                        vm.elm,
                    );
                }
            }
            vmBeingUpdated = null; // releasing the lock
            // not need to wrap or check the value since that is happening somewhere else
            if (set) {
                set.call(this, reactiveMembrane.getReadOnlyProxy(newValue));
            } else if (process.env.NODE_ENV !== 'production') {
                assert.fail(
                    `Invalid attempt to set a new value for property ${toString(
                        key,
                    )} of ${vm} that does not has a setter decorated with @api.`,
                );
            }
        },
        enumerable,
    };
}
