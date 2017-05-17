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
} = Object;
const isArray = Array.isArray;
const { slice: ArraySlice, splice: ArraySplice, indexOf: ArrayIndexOf, push: ArrayPush } = Array.prototype;

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
    ArraySlice,
    ArraySplice,
    isArray,
    ArrayIndexOf,
    ArrayPush,
}

export function isUndefined(obj: any): boolean {
    return obj === undefined;
}

export function isNull(obj: any): boolean {
    return obj === null;
}

export function isTrue(obj: any): boolean {
    return obj === true;
}

export function isFunction(obj: any): boolean {
    return typeof obj === 'function';
}
export function isObject(obj: any): boolean {
    return typeof obj === 'object';
}

export function isString(obj: any): boolean {
    return typeof obj === 'string';
}

export function isNumber(obj: any): boolean {
    return typeof obj === 'number';
}

export function isPromise(obj: any): boolean {
    return typeof obj === 'object' && obj === Promise.resolve(obj);
}

const OtS = {}.toString;
export function toString(obj: any): string {
    if (obj && typeof obj === 'object' && !obj.toString) {
        return OtS.call(obj);
    }
    return obj + '';
}

export function bind(fn: Function, ctx: Object): Function {
    function boundFn(a: any): any {
        const l = arguments.length
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)
                : fn.call(ctx, a)
            : fn.call(ctx)
    }
    return boundFn;
}
