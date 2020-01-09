/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isUndefined } from './language';

/*
 * The __type property on HiddenField doesn't actually exists at runtime. It is only used to store
 * the type of the associated field value.
 */
export type HiddenField<T> = { __type: T };

/*
 * In IE11, symbols are expensive.
 * Due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported. Note that we can't use typeof since it will fail when transpiling.
 */
const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function createHiddenField<T = unknown>(key: string, namespace: string): HiddenField<T> {
    return (hasNativeSymbolsSupport ? Symbol(key) : `$$lwc-${namespace}-${key}$$`) as any;
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
