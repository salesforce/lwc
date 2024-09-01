/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const {
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
    /** Detached {@linkcode Object.getOwnPropertyDescriptor}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor MDN Reference}. */
    getOwnPropertyDescriptor,
    /** Detached {@linkcode Object.getOwnPropertyDescriptors}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptors MDN Reference}. */
    getOwnPropertyDescriptors,
    /** Detached {@linkcode Object.getOwnPropertyNames}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyNames MDN Reference}. */
    getOwnPropertyNames,
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

const {
    /** Detached {@linkcode Array.isArray}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray MDN Reference}. */
    isArray,
    /** Detached {@linkcode Array.from}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from MDN Reference}. */
    from: ArrayFrom,
} = Array;

/** The most extensible array type. */
type BaseArray = readonly unknown[];
/** Names of methods that can be used on a readonly array. */
type ArrayPureMethodNames = {
    [K in keyof BaseArray]: K extends string
        ? BaseArray[K] extends (...args: any) => any
            ? K
            : never
        : never;
}[keyof BaseArray];
/**
 * Unbound array methods, re-typed so that `.call` and `.apply` correctly report type errors.
 * @example
 * const arr = ['a', 'b', 'c']
 * const trim = (str: string) => str.trim()
 * const sq = (num: number) => num ** 2
 * const unboundForEach = arr.forEach
 * unboundForEach.call(arr, trim) // passes - good
 * unboundForEach.call(arr, sq) // passes - BAD!
 * const fixedForEach = arr.forEach as UnboundArrayPureMethods['forEach']
 * fixedForEach.call(arr, trim) // passes - good
 * fixedForEach.call(arr, sq) // error - yay!
 */
type UnboundArrayPureMethods = {
    [K in ArrayPureMethodNames]: {
        call: <T extends BaseArray>(thisArg: T, ...args: Parameters<T[K]>) => ReturnType<T[K]>;
        apply: <T extends BaseArray>(thisArg: T, args: Parameters<T[K]>) => ReturnType<T[K]>;
    };
};

/** Names of methods that mutate an array (cannot be used on a readonly array). */
type ArrayMutationMethodNames = Exclude<keyof unknown[], keyof BaseArray>;
/**
 * Unbound array mutation methods, re-typed so that `.call` and `.apply` correctly report type errors.
 * @see {@link UnboundArrayPureMethods} for an example showing why this is needed.
 */
type UnboundArrayMutationMethods = {
    [K in ArrayMutationMethodNames]: {
        call: <T extends unknown[]>(thisArg: T, ...args: Parameters<T[K]>) => ReturnType<T[K]>;
        apply: <T extends unknown[]>(thisArg: T, args: Parameters<T[K]>) => ReturnType<T[K]>;
    };
};

// For some reason, JSDoc don't get picked up for multiple renamed destructured constants (even
// though it works fine for one, e.g. isArray), so comments for these are added to the export
// statement, rather than this declaration.
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
    forEach, // Weird anomaly!
}: UnboundArrayPureMethods & UnboundArrayMutationMethods = Array.prototype;

// The type of the return value of Array.prototype.every is `this is T[]`. However, once this
// Array method is pulled out of the prototype, the function is now referencing `this` where
// `this` is meaningless, resulting in a TypeScript compilation error.
//
// Exposing this helper function is the closest we can get to preserving the usage patterns
// of Array.prototype methods used elsewhere in the codebase.
/**
 * Wrapper for {@linkcode Array.prototype.every} that correctly preserves the type predicate in the
 * return value; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every MDN Reference}.
 * @param arr Array to test.
 * @param predicate A function to execute for each element of the array.
 * @returns Whether all elements in the array pass the test provided by the predicate.
 */
function arrayEvery<S extends T, T = unknown>(
    arr: readonly T[],
    predicate: (value: any, index: number, array: readonly T[]) => value is S
): arr is readonly S[] {
    return ArrayEvery.call(arr, predicate);
}

/** Detached {@linkcode String.fromCharCode}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode MDN Reference}. */
const { fromCharCode: StringFromCharCode } = String;

// No JSDocs here - see comment for Array.prototype
const {
    charAt: StringCharAt,
    charCodeAt: StringCharCodeAt,
    replace: StringReplace,
    split: StringSplit,
    slice: StringSlice,
    toLowerCase: StringToLowerCase,
    trim: StringTrim,
} = String.prototype;

export {
    /*
     * Array static
     */
    /** Detached {@linkcode Array.isArray}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray MDN Reference}. */
    isArray,
    /** Detached {@linkcode Array.from}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from MDN Reference}. */
    ArrayFrom,
    /*
     * Array prototype
     */
    /** Unbound {@linkcode Array.prototype.concat}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat MDN Reference}. */
    ArrayConcat,
    /** Unbound {@linkcode Array.prototype.copyWithin}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin MDN Reference}. */
    ArrayCopyWithin,
    /** Unbound {@linkcode Array.prototype.every}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every MDN Reference}. */
    ArrayEvery,
    /** Unbound {@linkcode Array.prototype.fill}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill MDN Reference}. */
    ArrayFill,
    /** Unbound {@linkcode Array.prototype.filter}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter MDN Reference}. */
    ArrayFilter,
    /** Unbound {@linkcode Array.prototype.find}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find MDN Reference}. */
    ArrayFind,
    /** Unbound {@linkcode Array.prototype.findIndex}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex MDN Reference}. */
    ArrayFindIndex,
    /** Unbound {@linkcode Array.prototype.includes}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes MDN Reference}. */
    ArrayIncludes,
    /** Unbound {@linkcode Array.prototype.indexOf}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf MDN Reference}. */
    ArrayIndexOf,
    /** Unbound {@linkcode Array.prototype.join}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/join MDN Reference}. */
    ArrayJoin,
    /** Unbound {@linkcode Array.prototype.map}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map MDN Reference}. */
    ArrayMap,
    /** Unbound {@linkcode Array.prototype.pop}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop MDN Reference}. */
    ArrayPop,
    /** Unbound {@linkcode Array.prototype.push}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push MDN Reference}. */
    ArrayPush,
    /** Unbound {@linkcode Array.prototype.reduce}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce MDN Reference}. */
    ArrayReduce,
    /** Unbound {@linkcode Array.prototype.reverse}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse MDN Reference}. */
    ArrayReverse,
    /** Unbound {@linkcode Array.prototype.shift}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift MDN Reference}. */
    ArrayShift,
    /** Unbound {@linkcode Array.prototype.slice}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice MDN Reference}. */
    ArraySlice,
    /** Unbound {@linkcode Array.prototype.some}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some MDN Reference}. */
    ArraySome,
    /** Unbound {@linkcode Array.prototype.sort}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort MDN Reference}. */
    ArraySort,
    /** Unbound {@linkcode Array.prototype.splice}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice MDN Reference}. */
    ArraySplice,
    /** Unbound {@linkcode Array.prototype.unshift}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift MDN Reference}. */
    ArrayUnshift,
    /** Unbound {@linkcode Array.prototype.forEach}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach MDN Reference}. */
    forEach, // Doesn't follow convention!
    arrayEvery, // Not actually Array#every!
    /*
     * Object static
     */
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
    /*
     * String static
     */
    StringFromCharCode,
    /*
     * String prototype
     */
    /** Unbound {@linkcode String.prototype.charAt}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt MDN Reference}. */
    StringCharAt,
    /** Unbound {@linkcode String.prototype.charCodeAt}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt MDN Reference}. */
    StringCharCodeAt,
    /** Unbound {@linkcode String.prototype.replace}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace MDN Reference}. */
    StringReplace,
    /** Unbound {@linkcode String.prototype.split}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split MDN Reference}. */
    StringSplit,
    /** Unbound {@linkcode String.prototype.slice}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice MDN Reference}. */
    StringSlice,
    /** Unbound {@linkcode String.prototype.toLowerCase}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase MDN Reference}. */
    StringToLowerCase,
    /** Unbound {@linkcode String.prototype.trim}; see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim MDN Reference}. */
    StringTrim,
};

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
            return ArrayJoin.call(ArrayMap.call(obj, toString), ',');
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
        if (!isUndefined(d)) {
            return d;
        }
        o = getPrototypeOf(o);
    } while (o !== null);
}
