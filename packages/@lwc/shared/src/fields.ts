/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isUndefined } from './language';
import { hasNativeSymbolSupport } from './symbol';

/*
 * The __type property on HiddenField doesn't actually exists at runtime. It is only used to store
 * the type of the associated field value.
 */
export type HiddenField<T> = { __type: T };

// This method abstracts the creation of symbols, so we can fallback to strings when native symbols
// are not supported.
export function createHiddenField<T = unknown>(key: string, namespace: string): HiddenField<T> {
    return (hasNativeSymbolSupport ? Symbol(key) : `$$lwc-${namespace}-${key}$$`) as any;
}

const hiddenFieldsMap: WeakMap<any, Record<any, any>> = new WeakMap();

export function setHiddenField<T>(o: any, field: HiddenField<T>, value: T): void {
    let valuesByField = hiddenFieldsMap.get(o);

    if (isUndefined(valuesByField)) {
        valuesByField = create(null);
        hiddenFieldsMap.set(o, valuesByField!);
    }

    valuesByField![field as any] = value;
}

export function getHiddenField<T>(o: any, field: HiddenField<T>): T | undefined {
    const valuesByField = hiddenFieldsMap.get(o);

    if (!isUndefined(valuesByField)) {
        return valuesByField[field as any];
    }
}
