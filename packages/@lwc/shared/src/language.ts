/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const {
    assign,
    create,
    defineProperties,
    defineProperty,
    entries,
    freeze,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getPrototypeOf,
    hasOwnProperty,
    isExtensible,
    isFrozen,
    keys,
    seal,
    setPrototypeOf,
} = Object;

const { isArray } = Array;

const {
    concat: ArrayConcat,
    copyWithin: ArrayCopyWithin,
    fill: ArrayFill,
    filter: ArrayFilter,
    find: ArrayFind,
    forEach,
    includes: ArrayIncludes,
    indexOf: ArrayIndexOf,
    join: ArrayJoin,
    map: ArrayMap,
    pop: ArrayPop,
    push: ArrayPush,
    reduce: ArrayReduce,
    reverse: ArrayReverse,
    shift: ArrayShift,
    slice: ArraySlice,
    some: ArraySome,
    sort: ArraySort,
    splice: ArraySplice,
    unshift: ArrayUnshift,
} = Array.prototype;

const { fromCharCode: StringFromCharCode } = String;

const {
    charCodeAt: StringCharCodeAt,
    endsWith: StringEndsWith,
    match: StringMatch,
    replace: StringReplace,
    slice: StringSlice,
    split: StringSplit,
    startsWith: StringStartsWith,
    substring: StringSubstring,
    toLowerCase: StringToLowerCase,
    trim: StringTrim,
} = String.prototype;

const { toString: NumberToString } = Number.prototype;

export {
    ArrayConcat,
    ArrayCopyWithin,
    ArrayFill,
    ArrayFilter,
    ArrayFind,
    ArrayIncludes,
    ArrayIndexOf,
    ArrayJoin,
    ArrayMap,
    ArrayPop,
    ArrayPush,
    ArrayReduce,
    ArrayReverse,
    ArrayShift,
    ArraySlice,
    ArraySome,
    ArraySort,
    ArraySplice,
    ArrayUnshift,
    NumberToString,
    StringCharCodeAt,
    StringEndsWith,
    StringFromCharCode,
    StringMatch,
    StringReplace,
    StringSlice,
    StringSplit,
    StringStartsWith,
    StringSubstring,
    StringToLowerCase,
    StringTrim,
    assign,
    create,
    defineProperties,
    defineProperty,
    entries,
    forEach,
    freeze,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getPrototypeOf,
    hasOwnProperty,
    isArray,
    isExtensible,
    isFrozen,
    keys,
    seal,
    setPrototypeOf,
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

export function isBoolean(obj: any): obj is boolean {
    return typeof obj === 'boolean';
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

export function noop(): void {
    /* Do nothing */
}

const OtS = {}.toString;
export function toString(obj: any): string {
    if (obj && obj.toString) {
        // Arrays might hold objects with "null" prototype So using
        // Array.prototype.toString directly will cause an error Iterate through
        // all the items and handle individually.
        if (isArray(obj)) {
            return ArrayJoin.call(ArrayMap.call(obj, toString), ',');
        }
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
