/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../../shared/assert';
import { isObject, isUndefined, isFalse } from '../../shared/language';
import { DecoratorFunction } from './decorate';
import { ComponentConstructor, ComponentInterface } from '../component';
import { isRendering, vmBeingRendered } from '../invoker';
import { valueObserved, valueMutated } from '../../libs/mutation-tracker';
import { getComponentVM } from '../vm';
import { reactiveMembrane } from '../membrane';

function wireDecorator(
    target: ComponentConstructor,
    prop: string,
    descriptor: PropertyDescriptor | undefined
): PropertyDescriptor | any {
    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(descriptor)) {
            const { get, set, configurable, writable } = descriptor;
            assert.isTrue(
                !get && !set,
                `Compiler Error: A @wire decorator can only be applied to a public field.`
            );
            assert.isTrue(
                configurable !== false,
                `Compiler Error: A @wire decorator can only be applied to a configurable property.`
            );
            assert.isTrue(
                writable !== false,
                `Compiler Error: A @wire decorator can only be applied to a writable property.`
            );
        }
    }
    return createWiredPropertyDescriptor(
        target,
        prop,
        isObject(descriptor) ? descriptor.enumerable === true : true
    );
}

/**
 * @wire decorator to wire fields and methods to a wire adapter in
 * LWC Components. This function implements the internals of this
 * decorator.
 */
export default function wire(_adapter: any, _config: any): DecoratorFunction {
    const len = arguments.length;
    if (len > 0 && len < 3) {
        return wireDecorator;
    } else {
        if (process.env.NODE_ENV !== 'production') {
            assert.fail('@wire(adapter, config?) may only be used as a decorator.');
        }
        throw new TypeError();
    }
}

function createWiredPropertyDescriptor(
    Ctor: ComponentConstructor,
    key: string,
    enumerable: boolean
): PropertyDescriptor {
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
                    `${vmBeingRendered}.render() method has side effects on the wired field ${vm}.${String(
                        key
                    )}`
                );
            }
            // making the wired value as readonly
            newValue = reactiveMembrane.getReadOnlyProxy(newValue);
            if (newValue !== vm.cmpFields[key]) {
                vm.cmpFields[key] = newValue;
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
