/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// returns a read-only version via a proxy
export function getImmutable(obj) {
    const handler = {
        get: (target, key) => {
            const value = target[key];
            if (value && typeof value === 'object') {
                return getImmutable(value);
            }
            return value;
        },
        set: () => {
            return false;
        },
        deleteProperty: () => {
            return false;
        },
    };
    return new Proxy(obj, handler);
}

// wraps a value in an observable that emits one immutable value
export function getImmutableObservable(value) {
    return getSubject(getImmutable(value)).observable;
}

// gets a subject with optional initial value and initial error
export function getSubject(initialValue, initialError) {
    let observer;

    function next(value) {
        observer.next(value);
    }

    function error(err) {
        observer.error(err);
    }

    function complete() {
        observer.complete();
    }

    const observable = {
        subscribe: obs => {
            observer = obs;
            if (initialValue) {
                next(initialValue);
            }
            if (initialError) {
                error(initialError);
            }
            return {
                unsubscribe: () => {},
            };
        },
    };

    return {
        next,
        error,
        complete,
        observable,
    };
}
