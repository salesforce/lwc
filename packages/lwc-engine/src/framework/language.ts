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
    forEach,
} = Array.prototype;

export {
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
    ArraySlice,
    ArraySplice,
    ArrayUnshift,
    ArrayFilter,
    ArrayMap,
    ArrayConcat,
    isArray,
    ArrayIndexOf,
    ArrayPush,
    forEach,
}

export function isUndefined(obj: any): obj is undefined {
    return obj === undefined;
}

export function isNull(obj: any): obj is null {
    return obj === null;
}

export function isTrue(obj: any): obj is true {
    return obj === true;
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
    if (obj && typeof obj === 'object' && !obj.toString) {
        return OtS.call(obj);
    }
    return obj + '';
}
