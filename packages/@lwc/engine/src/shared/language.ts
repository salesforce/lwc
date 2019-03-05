/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const {
    freeze,
    seal,
    keys,
    create,
    assign,
    defineProperty,
    getPrototypeOf,
    setPrototypeOf,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    defineProperties,
    getOwnPropertySymbols,
    hasOwnProperty,
    preventExtensions,
    isExtensible,
} = Object;
const { isArray } = Array;
const {
    concat: ArrayConcat,
    filter: ArrayFilter,
    slice: ArraySlice,
    splice: ArraySplice,
    unshift: ArrayUnshift,
    indexOf: ArrayIndexOf,
    push: ArrayPush,
    map: ArrayMap,
    join: ArrayJoin,
    forEach,
    reduce: ArrayReduce,
    reverse: ArrayReverse,
} = Array.prototype;

const {
    replace: StringReplace,
    toLowerCase: StringToLowerCase,
    indexOf: StringIndexOf,
    charCodeAt: StringCharCodeAt,
    slice: StringSlice,
    split: StringSplit,
} = String.prototype;

export {
    StringToLowerCase,
    StringReplace,
    StringIndexOf,
    StringCharCodeAt,
    StringSlice,
    StringSplit,
    freeze,
    seal,
    keys,
    create,
    assign,
    defineProperty,
    defineProperties,
    getPrototypeOf,
    setPrototypeOf,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    hasOwnProperty,
    preventExtensions,
    isExtensible,
    ArrayReduce,
    ArraySlice,
    ArraySplice,
    ArrayUnshift,
    ArrayFilter,
    ArrayMap,
    ArrayJoin,
    ArrayConcat,
    isArray,
    ArrayIndexOf,
    ArrayPush,
    ArrayReverse,
    forEach,
};

export function isUndefined(obj: any): obj is undefined {
    return obj === undefined;
}

export function isNull(obj: any): obj is null {
    return obj === null;
}

export function isTrue(obj: any): obj is true {
    return obj === true;
}

export function isFalse(obj: any): obj is false {
    return obj === false;
}

export function isFunction(obj: any): obj is Function {
    return typeof obj === 'function';
}
export function isObject(obj: any): obj is object {
    return typeof obj === 'object';
}

export function isString(obj: any): obj is string {
    return typeof obj === 'string';
}

export function isNumber(obj: any): obj is number {
    return typeof obj === 'number';
}

const OtS = {}.toString;
export function toString(obj: any): string {
    if (obj && obj.toString) {
        return obj.toString();
    } else if (typeof obj === 'object') {
        return OtS.call(obj);
    } else {
        return obj + '';
    }
}

export function getPropertyDescriptor(o: any, p: PropertyKey): PropertyDescriptor | undefined {
    do {
        const d = getOwnPropertyDescriptor(o, p);
        if (!isUndefined(d)) {
            return d;
        }
        o = getPrototypeOf(o);
    } while (o !== null);
}

export const emptyString = '';
