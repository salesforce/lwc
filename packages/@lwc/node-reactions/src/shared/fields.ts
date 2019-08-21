/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, hasOwnProperty } from './language';

/**
 * In IE11, symbols are expensive.
 * Due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported. Note that we can't use typeof since it will fail when transpiling.
 */
const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function createFieldName(key: string): symbol {
    // @ts-ignore: using a string as a symbol for perf reasons
    return hasNativeSymbolsSupport ? Symbol(key) : `$$node-reactions-${key}$$`;
}

export function setInternalField(o: object, fieldName: symbol, value: any) {
    // TODO: #1299 - improve this to use a WeakMap
    defineProperty(o, fieldName, {
        value,
    });
}

export function getInternalField(o: object, fieldName: symbol): any {
    // @ts-ignore: using a string as a symbol for perf reasons
    return hasOwnProperty.call(o, fieldName) ? o[fieldName] : undefined;
}
