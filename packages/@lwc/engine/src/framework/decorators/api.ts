/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../../shared/assert';
import { isRendering, vmBeingRendered, isBeingConstructed } from '../invoker';
import { isObject, toString, isFalse } from '../../shared/language';
import { valueObserved, valueMutated } from '@lwc/reactive-service';
import { ComponentInterface, ComponentConstructor } from '../component';
import { getComponentVM } from '../vm';
import { isUndefined, isFunction } from '../../shared/language';
import { getDecoratorsRegisteredMeta } from './register';

/**
 * @api decorator to mark public fields and public methods in
 * LWC Components. This function implements the internals of this
 * decorator.
 */
export default function api(
    target: ComponentConstructor,
    propName: PropertyKey,
    descriptor: PropertyDescriptor | undefined
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
                propName
            )} definition in ${target}, it cannot be a prototype definition if it is a public property. Instead use the constructor to define it.`
        );
        if (isObject(descriptor) && isFunction(descriptor.set)) {
            assert.isTrue(
                isObject(descriptor) && isFunction(descriptor.get),
                `Missing getter for property ${toString(
                    propName
                )} decorated with @api in ${target}. You cannot have a setter without the corresponding getter.`
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

function createPublicPropertyDescriptor(
    proto: ComponentConstructor,
    key: PropertyKey,
    descriptor: PropertyDescriptor | undefined
): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    const name = vm.elm.constructor.name;
                    assert.logError(
                        `\`${name}\` constructor can’t read the value of property \`${toString(
                            key
                        )}\` because the owner component hasn’t set the value yet. Instead, use the \`${name}\` constructor to set a default value for the property.`,
                        vm.elm
                    );
                }
                return;
            }
            valueObserved(this, key);
            return vm.cmpProps[key];
        },
        set(this: ComponentInterface, newValue: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
                assert.invariant(
                    !isRendering,
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(
                        key
                    )}`
                );
            }
            vm.cmpProps[key] = newValue;

            // avoid notification of observability if the instance is already dirty
            if (isFalse(vm.isDirty)) {
                // perf optimization to skip this step if the component is dirty already.
                valueMutated(this, key);
            }
        },
        enumerable: isUndefined(descriptor) ? true : descriptor.enumerable,
    };
}

function createPublicAccessorDescriptor(
    Ctor: ComponentConstructor,
    key: PropertyKey,
    descriptor: PropertyDescriptor
): PropertyDescriptor {
    const { get, set, enumerable } = descriptor;
    if (!isFunction(get)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail(
                `Invalid attempt to create public property descriptor ${toString(
                    key
                )} in ${Ctor}. It is missing the getter declaration with @api get ${toString(
                    key
                )}() {} syntax.`
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
                    `${vmBeingRendered}.render() method has side effects on the state of ${vm}.${toString(
                        key
                    )}`
                );
            }
            if (set) {
                set.call(this, newValue);
            } else if (process.env.NODE_ENV !== 'production') {
                assert.fail(
                    `Invalid attempt to set a new value for property ${toString(
                        key
                    )} of ${vm} that does not has a setter decorated with @api.`
                );
            }
        },
        enumerable,
    };
}
