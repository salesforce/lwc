import {
    ProxySlot,
    ProxyIdentifier,
    inOperator,
    XProxyInstance
} from "./xproxy";

export type compatGetKey = (replicaOrAny: any, key: PropertyKey) => any;
export type compatCallKey = (replicaOrAny: any, key: PropertyKey, ...args: Array<any>) => any;
export type compatSetKey = (replicaOrAny: any, key: PropertyKey, newValue: any, originalReturnValue?: any) => any;
export type compatDeleteKey = (replicaOrAny: any, key: PropertyKey) => boolean;
export type compatInKey = (replicaOrAny: any, key: PropertyKey) => boolean;
export type compatIterableKey = (replicaOrAny: any) => Array<any>;
const { getPrototypeOf } = Object;


export function defaultHasInstance (instance: any, Type: any) {
    // We have to grab getPrototypeOf here
    // because caching it at the module level is too early.
    // We need our shimmed version.
    const { getPrototypeOf } = Object;
    let instanceProto = getPrototypeOf(instance);
    const TypeProto = getKey(Type, 'prototype');
    while (instanceProto !== null) {
        if (instanceProto === TypeProto) {
            return true;
        }
        instanceProto = getPrototypeOf(instanceProto)
    }
    return false;
}

export function isCompatProxy(replicaOrAny: any): replicaOrAny is XProxyInstance {
    return replicaOrAny && replicaOrAny[ProxySlot] === ProxyIdentifier;
}

export const getKey: compatGetKey = function(replicaOrAny: any, key: PropertyKey): any {
    return isCompatProxy(replicaOrAny) ?
        replicaOrAny.get(key) :
        replicaOrAny[key];
}

export const callKey: compatCallKey = function(replicaOrAny: any, key: PropertyKey, a1: any, a2: any, a3: any): any {
    const fn = getKey(replicaOrAny, key);
    const l = arguments.length;

    switch (l) {
      case 2: return fn.call(replicaOrAny);
      case 3: return fn.call(replicaOrAny, a1);
      case 4: return fn.call(replicaOrAny, a1, a2);
      case 5: return fn.call(replicaOrAny, a1, a2, a3);

      default:
        const args = [];
        for (let i = 2; i < l; i++) {
            args[i - 2] = arguments[i];
        }
        return fn.apply(replicaOrAny, args);
    }
}

export const setKey: compatSetKey = function(replicaOrAny: any, key: PropertyKey, newValue: any, originalReturnValue?: any): any {
    if (isCompatProxy(replicaOrAny)) {
        replicaOrAny.set(key, newValue);
    } else {
        replicaOrAny[key] = newValue;
    }
    return arguments.length === 4 ? originalReturnValue : newValue;
}

export const deleteKey: compatDeleteKey = function(replicaOrAny: any, key: PropertyKey) {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.deleteProperty(key);
    }
    delete replicaOrAny[key];
}

export const inKey: compatInKey = function(replicaOrAny: any, key: PropertyKey): boolean {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.has(key);
    }
    return inOperator(replicaOrAny, key);
}

export const iterableKey: compatIterableKey = function (replicaOrAny: any): Array<any> {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.forIn();
    }
    return replicaOrAny;
}

export function instanceOfKey(instance: any, Type: any): boolean {
    const instanceIsCompatProxy = isCompatProxy(instance);
    if (!isCompatProxy(Type) && !instanceIsCompatProxy) {
        return instance instanceof Type;
    }
    // TODO: Once polyfills are transpiled to compat
    // We can probably remove the below check
    if (instanceIsCompatProxy) {
        return defaultHasInstance(instance, Type);
    }
    return Type[Symbol.hasInstance](instance);
}
