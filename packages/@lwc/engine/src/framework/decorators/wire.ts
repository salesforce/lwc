/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert } from '@lwc/shared';
import { ComponentInterface } from '../component';
import { componentValueObserved } from '../mutation-tracker';
import { getComponentVM } from '../vm';
import { WireAdapterConstructor } from '../wiring';

/**
 * @wire decorator to wire fields and methods to a wire adapter in
 * LWC Components. This function implements the internals of this
 * decorator.
 */
export default function wire(
    _adapter: WireAdapterConstructor,
    _config?: Record<string, any>
): PropertyDecorator | MethodDecorator {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail('@wire(adapter, config?) may only be used as a decorator.');
    }
    throw new Error();
}

export function internalWireFieldDecorator(key: string): PropertyDescriptor {
    return {
        get(this: ComponentInterface): any {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            componentValueObserved(vm, key);
            return vm.cmpFields[key];
        },
        set(this: ComponentInterface, value: any) {
            const vm = getComponentVM(this);
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
            }
            /**
             * intentionally ignoring the reactivity here since this is just
             * letting the author to do the wrong thing, but it will keep our
             * system to be backward compatible.
             */
            vm.cmpFields[key] = value;
        },
        enumerable: true,
        configurable: true,
    };
}
