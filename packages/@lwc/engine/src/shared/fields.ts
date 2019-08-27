/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, create, isUndefined } from './language';

/**
 * In IE11, symbols are expensive.
 * Due to the nature of the symbol polyfill. This method abstract the
 * creation of symbols, so we can fallback to string when native symbols
 * are not supported. Note that we can't use typeof since it will fail when transpiling.
 */
const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function createFieldName(key: string): symbol {
    // @ts-ignore: using a string as a symbol for perf reasons
    return hasNativeSymbolsSupport ? Symbol(key) : `$$lwc-engine-${key}$$`;
}

export function setInternalField(o: object, fieldName: symbol, value: any) {
    // TODO: #1299 - use a weak map instead
    defineProperty(o, fieldName, {
        value,
    });
}

export function getInternalField(o: object, fieldName: symbol): any {
    return o[fieldName];
}

/**
 * Store fields that should be hidden from outside world
 * hiddenFieldsMap is a WeakMap.
 * It stores a hash of any given objects associative relationships.
 * The hash uses the fieldName as the key, the value represents the other end of the association.
 *
 * For example, if the association is
 *              ViewModel
 * Component-A --------------> VM-1
 * then,
 * hiddenFieldsMap : (Component-A, { Symbol(ViewModel) : VM-1 })
 *
 */
const hiddenFieldsMap: WeakMap<any, Record<symbol, any>> = new WeakMap();
export const setHiddenField = hasNativeSymbolsSupport
    ? (o: any, fieldName: symbol, value: any): void => {
          let valuesByField = hiddenFieldsMap.get(o);
          if (isUndefined(valuesByField)) {
              valuesByField = create(null) as (Record<symbol, any>);
              hiddenFieldsMap.set(o, valuesByField);
          }
          valuesByField[fieldName] = value;
      }
    : setInternalField; // Fall back to symbol based approach in compat mode

export const getHiddenField = hasNativeSymbolsSupport
    ? (o: any, fieldName: symbol): any => {
          const valuesByField = hiddenFieldsMap.get(o);
          return !isUndefined(valuesByField) && valuesByField[fieldName];
      }
    : getInternalField; // Fall back to symbol based approach in compat mode
