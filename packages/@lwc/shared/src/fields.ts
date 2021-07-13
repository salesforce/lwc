/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from './language';
import { hasNativeSymbolSupport } from './symbol';

export type HiddenField<T> = {
    set: (o: any, value: T) => void;
    get: (o: any) => T | undefined;
};

// Typically there are lots of objects we're assigning hidden fields on, but few unique fields.
// So we create fewer objects and do less work to map from Field -> Object -> Value rather than
// from Object -> Field -> Value
const hiddenFieldMaps: Map<any, WeakMap<any, any>> = new Map();

export function createHiddenField<T = unknown>(key: string, namespace: string): HiddenField<T> {
    // Fallback to strings when native symbols are not supported.
    const field = hasNativeSymbolSupport ? Symbol(key) : `$$lwc-${namespace}-${key}$$`;
    let valuesByObject = hiddenFieldMaps.get(field);

    if (isUndefined(valuesByObject)) {
        valuesByObject = new WeakMap();
        hiddenFieldMaps.set(field, valuesByObject);
    }

    return {
        get(o) {
            return valuesByObject!.get(o);
        },
        set(o, value) {
            valuesByObject!.set(o, value);
        },
    };
}
