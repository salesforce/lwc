/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export const {
    /** Detached {@linkcode Object.assign}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign MDN Reference}. */
    assign,
    /** Detached {@linkcode Object.create}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create MDN Reference}. */
    create,
    /** Detached {@linkcode Object.defineProperties}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties MDN Reference}. */
    defineProperties,
    /** Detached {@linkcode Object.defineProperty}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty MDN Reference}. */
    defineProperty,
    /** Detached {@linkcode Object.entries}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries MDN Reference}. */
    entries,
    /** Detached {@linkcode Object.freeze}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze MDN Reference}. */
    freeze,
    /** Detached {@linkcode Object.fromEntries}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries MDN Reference}. */
    fromEntries,
    /** Detached {@linkcode Object.getOwnPropertyDescriptor}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor MDN Reference}. */
    getOwnPropertyDescriptor,
    /** Detached {@linkcode Object.getOwnPropertyDescriptors}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors MDN Reference}. */
    getOwnPropertyDescriptors,
    /** Detached {@linkcode Object.getOwnPropertyNames}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames MDN Reference}. */
    getOwnPropertyNames,
    /** Detached {@linkcode Object.getOwnPropertySymbols}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols MDN Reference}. */
    getOwnPropertySymbols,
    /** Detached {@linkcode Object.getPrototypeOf}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf MDN Reference}. */
    getPrototypeOf,
    /** Detached {@linkcode Object.hasOwnProperty}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty MDN Reference}. */
    hasOwnProperty,
    /** Detached {@linkcode Object.isFrozen}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/isFrozen MDN Reference}. */
    isFrozen,
    /** Detached {@linkcode Object.keys}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys MDN Reference}. */
    keys,
    /** Detached {@linkcode Object.seal}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal MDN Reference}. */
    seal,
    /** Detached {@linkcode Object.setPrototypeOf}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf MDN Reference}. */
    setPrototypeOf,
} = Object;

export const {
    /** Detached {@linkcode Array.isArray}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray MDN Reference}. */
    isArray,
    /** Detached {@linkcode Array.from}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from MDN Reference}. */
    from: ArrayFrom,
} = Array;

/** Detached {@linkcode String.fromCharCode}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode MDN Reference}. */
export const { fromCharCode: StringFromCharCode } = String;

/**
 * Determines whether the argument is `undefined`.
 * @param obj Value to test
 * @returns `true` if the value is `undefined`.
 */
export function isUndefined(obj: unknown): obj is undefined {
    return obj === undefined;
}

/**
 * Determines whether the argument is `null`.
 * @param obj Value to test
 * @returns `true` if the value is `null`.
 */
export function isNull(obj: unknown): obj is null {
    return obj === null;
}

/**
 * Determines whether the argument is `true`.
 * @param obj Value to test
 * @returns `true` if the value is `true`.
 */
export function isTrue(obj: unknown): obj is true {
    return obj === true;
}

/**
 * Determines whether the argument is `false`.
 * @param obj Value to test
 * @returns `true` if the value is `false`.
 */
export function isFalse(obj: unknown): obj is false {
    return obj === false;
}

/**
 * Determines whether the argument is a boolean.
 * @param obj Value to test
 * @returns `true` if the value is a boolean.
 */
export function isBoolean(obj: unknown): obj is boolean {
    return typeof obj === 'boolean';
}

/**
 * Determines whether the argument is a function.
 * @param obj Value to test
 * @returns `true` if the value is a function.
 */
// Replacing `Function` with a narrower type that works for all our use cases is tricky...
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction(obj: unknown): obj is Function {
    return typeof obj === 'function';
}

/**
 * Determines whether the argument is an object or null.
 * @param obj Value to test
 * @returns `true` if the value is an object or null.
 */
export function isObject(obj: unknown): obj is object | null {
    return typeof obj === 'object';
}

/**
 * Determines whether the argument is a string.
 * @param obj Value to test
 * @returns `true` if the value is a string.
 */
export function isString(obj: unknown): obj is string {
    return typeof obj === 'string';
}

/**
 * Determines whether the argument is a number.
 * @param obj Value to test
 * @returns `true` if the value is a number.
 */
export function isNumber(obj: unknown): obj is number {
    return typeof obj === 'number';
}

/** Does nothing! 🚀 */
export function noop(): void {
    /* Do nothing */
}

const OtS = {}.toString;
/**
 * Converts the argument to a string, safely accounting for objects with "null" prototype.
 * Note that `toString(null)` returns `"[object Null]"` rather than `"null"`.
 * @param obj Value to convert to a string.
 * @returns String representation of the value.
 */
export function toString(obj: unknown): string {
    if (obj?.toString) {
        // Arrays might hold objects with "null" prototype So using
        // Array.prototype.toString directly will cause an error Iterate through
        // all the items and handle individually.
        if (isArray(obj)) {
            // This behavior is slightly different from Array#toString:
            // 1. Array#toString calls `this.join`, rather than Array#join
            // Ex: arr = []; arr.join = () => 1; arr.toString() === 1; toString(arr) === ''
            // 2. Array#toString delegates to Object#toString if `this.join` is not a function
            // Ex: arr = []; arr.join = 'no'; arr.toString() === '[object Array]; toString(arr) = ''
            // 3. Array#toString converts null/undefined to ''
            // Ex: arr = [null, undefined]; arr.toString() === ','; toString(arr) === '[object Null],undefined'
            // 4. Array#toString converts recursive references to arrays to ''
            // Ex: arr = [1]; arr.push(arr, 2); arr.toString() === '1,,2'; toString(arr) throws
            // Ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toString
            return obj.map(toString).join(',');
        }
        return obj.toString();
    } else if (typeof obj === 'object') {
        // This catches null and returns "[object Null]". Weird, but kept for backwards compatibility.
        return OtS.call(obj);
    } else {
        return String(obj);
    }
}

/**
 * Gets the property descriptor for the given object and property key. Similar to
 * {@linkcode Object.getOwnPropertyDescriptor}, but looks up the prototype chain.
 * @param o Value to get the property descriptor for
 * @param p Property key to get the descriptor for
 * @returns The property descriptor for the given object and property key.
 */
export function getPropertyDescriptor(o: unknown, p: PropertyKey): PropertyDescriptor | undefined {
    do {
        const d = getOwnPropertyDescriptor(o, p);
        if (d !== undefined) {
            return d;
        }
        o = getPrototypeOf(o);
    } while (o !== null);
}
