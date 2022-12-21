/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, isFunction, globalThis } from '@lwc/shared';

type Callback = () => void;

/* istanbul ignore next */
function queueMicrotaskPolyfill() {
    let nextTickCallbackQueue: Callback[] = [];

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

    return function addCallbackToNextTick(callback: Callback) {
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
    };
}

// This is supported in all modern browsers https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask#browser_compatibility
// Basically the fallback is just for IE11
/* istanbul ignore next */
export const queueMicrotask = isFunction(globalThis.queueMicrotask)
    ? globalThis.queueMicrotask
    : queueMicrotaskPolyfill();
