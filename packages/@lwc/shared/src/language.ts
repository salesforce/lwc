/*
 * Copyright (c) 2024, Salesforce, Inc.
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
    getOwnPropertyDescriptors,
    getOwnPropertyNames,
    getPrototypeOf,
    hasOwnProperty,
    isFrozen,
    keys,
    seal,
    setPrototypeOf,
} = Object;

const { isArray } = Array;

const {
    concat: ArrayConcat,
    copyWithin: ArrayCopyWithin,
    every: ArrayEvery,
    fill: ArrayFill,
    filter: ArrayFilter,
    find: ArrayFind,
    findIndex: ArrayFindIndex,
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
    forEach,
} = Array.prototype;

// The type of the return value of Array.prototype.every is `this is T[]`. However, once this
// Array method is pulled out of the prototype, the function is now referencing `this` where
// `this` is meaningless, resulting in a TypeScript compilation error.
//
// Exposing this helper function is the closest we can get to preserving the usage patterns
// of Array.prototype methods used elsewhere in the codebase.
function arrayEvery<T>(
    arr: unknown[],
    predicate: (value: any, index: number, array: typeof arr) => value is T
): arr is T[] {
    return ArrayEvery.call(arr, predicate);
}

const { fromCharCode: StringFromCharCode } = String;

const {
    charCodeAt: StringCharCodeAt,
    replace: StringReplace,
    split: StringSplit,
    slice: StringSlice,
    toLowerCase: StringToLowerCase,
} = String.prototype;

export {
    ArrayConcat,
    ArrayFilter,
    ArrayFind,
    ArrayFindIndex,
    ArrayFill,
    ArrayIncludes,
    ArrayIndexOf,
    ArrayCopyWithin,
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
    arrayEvery,
    assign,
    create,
    defineProperties,
    defineProperty,
    entries,
    forEach,
    freeze,
    getOwnPropertyDescriptor,
    getOwnPropertyDescriptors,
    getOwnPropertyNames,
    getPrototypeOf,
    hasOwnProperty,
    isArray,
    isFrozen,
    keys,
    seal,
    setPrototypeOf,
    StringCharCodeAt,
    StringReplace,
    StringSlice,
    StringSplit,
    StringToLowerCase,
    StringFromCharCode,
};

export function isUndefined(obj: unknown): obj is undefined {
    return obj === undefined;
}

export function isNull(obj: unknown): obj is null {
    return obj === null;
}

export function isTrue(obj: unknown): obj is true {
    return obj === true;
}

export function isFalse(obj: unknown): obj is false {
    return obj === false;
}

export function isBoolean(obj: unknown): obj is boolean {
    return typeof obj === 'boolean';
}

// Replacing `Function` with a narrower type that works for all our use cases is tricky...
// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(obj: unknown): obj is Function {
    return typeof obj === 'function';
}
export function isObject(obj: unknown): obj is object | null {
    return typeof obj === 'object';
}

export function isString(obj: unknown): obj is string {
    return typeof obj === 'string';
}

export function isNumber(obj: unknown): obj is number {
    return typeof obj === 'number';
}

export function noop(): void {
    /* Do nothing */
}

const OtS = {}.toString;
export function toString(obj: unknown): string {
    if (obj?.toString) {
        // Arrays might hold objects with "null" prototype So using
        // Array.prototype.toString directly will cause an error Iterate through
        // all the items and handle individually.
        if (isArray(obj)) {
            return ArrayJoin.call(ArrayMap.call(obj, toString), ',');
        }
        return obj.toString();
    } else if (typeof obj === 'object') {
        // Oops! This catches null and returns "[object Null]"
        return OtS.call(obj);
    } else {
        return String(obj);
    }
}

export function getPropertyDescriptor(o: unknown, p: PropertyKey): PropertyDescriptor | undefined {
    do {
        const d = getOwnPropertyDescriptor(o, p);
        if (!isUndefined(d)) {
            return d;
        }
        o = getPrototypeOf(o);
    } while (o !== null);
}
