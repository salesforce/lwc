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
} = Object;
const isArray = Array.isArray;
const slice = Array.prototype.slice;

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
    slice,
    isArray,
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
export function isObject(o: any): boolean {
	return typeof o === 'object';
}

export function isString(obj: any): boolean {
	return typeof obj === 'string';
}

export function isNumber(obj: any): boolean {
	return typeof obj === 'number';
}
