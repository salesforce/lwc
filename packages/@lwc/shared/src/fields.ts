/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isUndefined } from './language';

/*
 * Typescript doesn't allow indexing using Symbol, aliasing the Field type to any for now.
 * Details: https://github.com/microsoft/TypeScript/issues/1863
 */
type HiddenField = any;

/*
 * In IE11, symbols are expensive.
 * Due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported. Note that we can't use typeof since it will fail when transpiling.
 */
const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function createFieldName(key: string, namespace: string): HiddenField {
    return hasNativeSymbolsSupport ? Symbol(key) : `$$lwc-${namespace}-${key}$$`;
}

const hiddenFieldsMap: WeakMap<any, Record<HiddenField, any>> = new WeakMap();

export function setHiddenField(o: any, field: HiddenField, value: any): void {
    let valuesByField = hiddenFieldsMap.get(o);

    if (isUndefined(valuesByField)) {
        valuesByField = create(null);
        hiddenFieldsMap.set(o, valuesByField!);
    }

    valuesByField![field] = value;
}

export function getHiddenField(o: any, field: HiddenField): unknown {
    const valuesByField = hiddenFieldsMap.get(o);

    if (!isUndefined(valuesByField)) {
        return valuesByField[field];
    }
}
