/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    getOwnPropertyNames,
    getOwnPropertyDescriptor,
    defineProperty,
    isFunction,
    isUndefined,
} from '../../shared/language';

export type DecoratorFunction = (
    Ctor: any,
    key: PropertyKey,
    descriptor: PropertyDescriptor | undefined
) => PropertyDescriptor;
export type DecoratorMap = Record<string, DecoratorFunction>;

export default function decorate(Ctor: any, decorators: DecoratorMap): any {
    // intentionally comparing decorators with null and undefined
    if (!isFunction(Ctor) || decorators == null) {
        throw new TypeError();
    }
    const props = getOwnPropertyNames(decorators);
    // intentionally allowing decoration of classes only for now
    const target = Ctor.prototype;
    for (let i = 0, len = props.length; i < len; i += 1) {
        const propName = props[i];
        const decorator = decorators[propName];
        if (!isFunction(decorator)) {
            throw new TypeError();
        }
        const originalDescriptor = getOwnPropertyDescriptor(target, propName);
        const descriptor = decorator(Ctor, propName, originalDescriptor);
        if (!isUndefined(descriptor)) {
            defineProperty(target, propName, descriptor);
        }
    }
    return Ctor; // chaining
}
