/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ObservableMembrane } from 'observable-membrane';
import { valueObserved, valueMutated } from './mutation-tracker';

const lockerLivePropertyKey = Symbol.for('@@lockerLiveValue');

const reactiveMembrane = new ObservableMembrane({
    valueObserved,
    valueMutated,
    tagPropertyKey: lockerLivePropertyKey,
});

/**
 * EXPERIMENTAL: This function implements an unwrap mechanism that
 * works for observable membrane objects. This API is subject to
 * change or being removed.
 */
export function unwrap(value: any): any {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    return process.env.IS_BROWSER ? reactiveMembrane.unwrapProxy(value) : value;
}

export function getReadOnlyProxy(value: any): any {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    return process.env.IS_BROWSER ? reactiveMembrane.getReadOnlyProxy(value) : value;
}

export function getProxy(value: any): any {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    return process.env.IS_BROWSER ? reactiveMembrane.getProxy(value) : value;
}

// Making the component instance a live value when using Locker to support expandos.
export function setLockerLivePropertyKey(obj: any): void {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    if (process.env.IS_BROWSER) {
        obj[lockerLivePropertyKey] = undefined;
    }
}
