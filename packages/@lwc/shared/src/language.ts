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
    arr: any[],
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
