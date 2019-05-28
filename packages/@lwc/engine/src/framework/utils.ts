/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, seal, ArrayPush, isFunction, hasOwnProperty } from '../shared/language';
import { createFieldName } from '../shared/fields';

type Callback = () => void;

let nextTickCallbackQueue: Callback[] = [];
export const SPACE_CHAR = 32;

export const EmptyObject = seal(create(null));
export const EmptyArray = seal([]);
export const ViewModelReflection = createFieldName('ViewModel');

function flushCallbackQueue() {
    if (process.env.NODE_ENV !== 'production') {
        if (nextTickCallbackQueue.length === 0) {
            throw new Error(
                `Internal Error: If callbackQueue is scheduled, it is because there must be at least one callback on this pending queue.`
            );
        }
    }
    const callbacks: Callback[] = nextTickCallbackQueue;
    nextTickCallbackQueue = []; // reset to a new queue
    for (let i = 0, len = callbacks.length; i < len; i += 1) {
        callbacks[i]();
    }
}

export function addCallbackToNextTick(callback: Callback) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(callback)) {
            throw new Error(
                `Internal Error: addCallbackToNextTick() can only accept a function callback`
            );
        }
    }
    if (nextTickCallbackQueue.length === 0) {
        Promise.resolve().then(flushCallbackQueue);
    }
    ArrayPush.call(nextTickCallbackQueue, callback);
}

interface CircularModuleDependency {
    <T>(): T;
    readonly __circular__?: any;
}

export function isCircularModuleDependency(value: any): value is CircularModuleDependency {
    return hasOwnProperty.call(value, '__circular__');
}

/**
 * When LWC is used in the context of an Aura application, the compiler produces AMD
 * modules, that doesn't resolve properly circular dependencies between modules. In order
 * to circumvent this issue, the module loader returns a factory with a symbol attached
 * to it.
 *
 * This method returns the resolved value if it received a factory as argument. Otherwise
 * it returns the original value.
 */
export function resolveCircularModuleDependency(fn: CircularModuleDependency): any {
    if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(fn)) {
            throw new TypeError(`Circular module dependency must be a function.`);
        }
    }
    return fn();
}

export const useSyntheticShadow = hasOwnProperty.call(Element.prototype, '$shadowToken$');
