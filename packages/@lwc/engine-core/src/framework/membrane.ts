/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ObservableMembrane } from 'observable-membrane';
import { valueObserved, valueMutated } from './mutation-tracker';

export const lockerLivePropertyKey = Symbol.for('@@lockerLiveValue');

export const reactiveMembrane = new ObservableMembrane({
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
    return reactiveMembrane.unwrapProxy(value);
}
