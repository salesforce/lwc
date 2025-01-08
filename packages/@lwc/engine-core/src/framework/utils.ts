/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    create,
    isFunction,
    keys,
    seal,
    isAPIFeatureEnabled,
    APIFeature,
} from '@lwc/shared';
import { logWarnOnce } from '../shared/logger';
import { getComponentAPIVersion, getComponentRegisteredName } from './component';
import type { LightningElementConstructor } from './base-lightning-element';

type Callback = () => void;

let nextTickCallbackQueue: Callback[] = [];
export const SPACE_CHAR = 32;

export const EmptyObject = seal(create(null));
export const EmptyArray = seal([]);

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
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.resolve().then(flushCallbackQueue);
    }
    ArrayPush.call(nextTickCallbackQueue, callback);
}

export function guid(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

// Make a shallow copy of an object but omit the given key
export function cloneAndOmitKey(object: { [key: string]: any }, keyToOmit: string) {
    const result: { [key: string]: any } = {};
    for (const key of keys(object)) {
        if (key !== keyToOmit) {
            result[key] = object[key];
        }
    }
    return result;
}

// Throw an error if we're running in prod mode. Ensures code is truly removed from prod mode.
export function assertNotProd() {
    /* istanbul ignore if */
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
}

export function shouldBeFormAssociated(Ctor: LightningElementConstructor) {
    const ctorFormAssociated = Boolean(Ctor.formAssociated);
    const apiVersion = getComponentAPIVersion(Ctor);
    const apiFeatureEnabled = isAPIFeatureEnabled(
        APIFeature.ENABLE_ELEMENT_INTERNALS_AND_FACE,
        apiVersion
    );

    if (process.env.NODE_ENV !== 'production' && ctorFormAssociated && !apiFeatureEnabled) {
        const tagName = getComponentRegisteredName(Ctor);
        logWarnOnce(
            `Component <${tagName}> set static formAssociated to true, but form ` +
                `association is not enabled because the API version is ${apiVersion}. To enable form association, ` +
                `update the LWC component API version to 61 or above. https://lwc.dev/guide/versioning`
        );
    }

    return ctorFormAssociated && apiFeatureEnabled;
}

// check if a property is in an object, and if the object throws an error merely because we are
// checking if the property exists, return false
export function safeHasProp<K extends PropertyKey>(
    obj: unknown,
    prop: K
): obj is Record<K, unknown> {
    try {
        return prop in (obj as any);
    } catch (_err) {
        return false;
    }
}
