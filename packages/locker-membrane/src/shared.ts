const {
    defineProperty,
    getOwnPropertyNames,
    isExtensible,
    getOwnPropertyDescriptor,
    getPrototypeOf,
    preventExtensions,
    setPrototypeOf
} = Object;

const {
    hasOwnProperty
} = Object.prototype;

const ArrayMap = Array.prototype.map;
const isArray = Array.isArray;

function isNull(obj: any): boolean {
    return obj === null;
}

function isObject(obj: any): boolean {
    return typeof obj === 'object';
}

function isFunction(obj: any): boolean {
    return typeof obj === 'function';
}

export {
    defineProperty,
    getOwnPropertyNames,
    isExtensible,
    getOwnPropertyDescriptor,
    getPrototypeOf,
    preventExtensions,
    ArrayMap,
    isArray,
    isNull,
    isObject,
    isFunction,
    setPrototypeOf,
    hasOwnProperty
}

export function isReplicable(value: any): value is Replicable {
    const type = typeof value;
    return value && (type === 'object' || type === 'function') && !(value instanceof HTMLIFrameElement);
}

export const OriginalTargetSlot = Symbol();
export const MembraneHandlerSlot = Symbol();
