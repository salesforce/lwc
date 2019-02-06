/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import ObservableMembrane from 'observable-membrane';
import { valueObserved, valueMutated } from '@lwc/reactive-service';

function valueDistortion(value: any) {
    return value;
}

export const reactiveMembrane = new ObservableMembrane({
    valueObserved,
    valueMutated,
    valueDistortion,
});

/**
 * EXPERIMENTAL: This function implements an unwrap mechanism that
 * works for observable membrane objects. This API is subject to
 * change or being removed.
 */
export const unwrap = function(value: any): any {
    const unwrapped = reactiveMembrane.unwrapProxy(value);
    if (unwrapped !== value) {
        // if value is a proxy, unwrap to access original value and apply distortion
        return valueDistortion(unwrapped);
    }
    return value;
};
