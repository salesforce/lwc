const { isArray } = Array;

const {
    getPrototypeOf,
    create: ObjectCreate,
    defineProperty: ObjectDefineProperty,
    defineProperties: ObjectDefineProperties,
    isExtensible,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    preventExtensions,
} = Object;

const {
    push: ArrayPush,
    concat: ArrayConcat,
    map: ArrayMap,
} = Array.prototype;

export {
    ArrayPush,
    ArrayConcat,
    ArrayMap,
    isArray,
    getPrototypeOf,
    ObjectCreate,
    ObjectDefineProperty,
    ObjectDefineProperties,
    isExtensible,
    getOwnPropertyDescriptor,
    getOwnPropertyNames,
    getOwnPropertySymbols,
    preventExtensions,
};

const ObjectDotPrototype = Object.prototype;

const OtS = {}.toString;
export function toString(obj: any): string {
    if (obj && obj.toString) {
        return obj.toString();
    } else if (typeof obj === 'object') {
        return OtS.call(obj);
    } else {
        return obj + '';
    }
}

export function isUndefined(obj: any): obj is undefined {
    return obj === undefined;
}

export const TargetSlot = Symbol();

// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
const { getKey } = Proxy;

export const unwrap = getKey ?
    (replicaOrAny: any): any => (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny
    : (replicaOrAny: any): any => (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny;

export function isObservable(value: any): boolean {
    // intentionally checking for null and undefined
    if (value == null) {
        return false;
    }
    if (isArray(value)) {
        return true;
    }

    const proto = getPrototypeOf(value);
    return (proto === ObjectDotPrototype || proto === null || getPrototypeOf(proto) === null);
}

export function isObject(obj: any): obj is object {
    return typeof obj === 'object';
}
