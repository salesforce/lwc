/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isFunction, toString } from '@lwc/shared';
import { logError } from '../../shared/assert';
import { isRendering, vmBeingRendered, isBeingConstructed } from '../invoker';
import { valueObserved, componentValueMutated } from '../mutation-tracker';
import { ComponentInterface } from '../component';
import { getComponentVM } from '../vm';

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
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            if (isBeingConstructed(vm)) {
                if (process.env.NODE_ENV !== 'production') {
                    const name = vm.elm.constructor.name;
                    logError(
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
        configurable,
    };
}
