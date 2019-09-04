/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isObject, isUndefined } from '@lwc/shared';
import { createTrackedPropertyDescriptor } from './track';
import { DecoratorFunction } from './decorate';
import { ComponentConstructor } from '../component';

function wireDecorator(
    target: ComponentConstructor,
    prop: PropertyKey,
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
    return createTrackedPropertyDescriptor(
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
