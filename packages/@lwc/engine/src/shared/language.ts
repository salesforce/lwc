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
    hasOwnProperty,
} = Object;
const { isArray } = Array;
const {
    slice: ArraySlice,
    unshift: ArrayUnshift,
    indexOf: ArrayIndexOf,
    push: ArrayPush,
    map: ArrayMap,
    join: ArrayJoin,
    forEach,
    reduce: ArrayReduce,
} = Array.prototype;

const {
    replace: StringReplace,
    toLowerCase: StringToLowerCase,
    charCodeAt: StringCharCodeAt,
    slice: StringSlice,
} = String.prototype;

export {
    StringToLowerCase,
    StringReplace,
    StringCharCodeAt,
    StringSlice,
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
    hasOwnProperty,
    ArrayReduce,
    ArraySlice,
    ArrayUnshift,
    ArrayMap,
    ArrayJoin,
    isArray,
    ArrayIndexOf,
    ArrayPush,
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
        // Arrays might hold objects with "null" prototype
        // So using Array.prototype.toString directly will cause an error
        // Iterate through all the items and handle individually.
        if (isArray(obj)) {
            return ArrayJoin.call(ArrayMap.call(obj, toString), ',');
        }

        return obj.toString();
    } else if (typeof obj === 'object') {
        return OtS.call(obj);
    } else {
        return obj + emptyString;
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
