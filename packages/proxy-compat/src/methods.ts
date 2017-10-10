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

export function isCompatProxy(replicaOrAny: any): replicaOrAny is XProxyInstance {
    return replicaOrAny && replicaOrAny[ProxySlot] === ProxyIdentifier;
}


export const getKey: compatGetKey = function(replicaOrAny: any, key: PropertyKey): any {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.get(key);
    }
    return replicaOrAny[key];
}

export const callKey: compatCallKey = function(replicaOrAny: any, key: PropertyKey, ...args: Array<any>): any {
    const fn = getKey(replicaOrAny, key);
    return fn.apply(replicaOrAny, args);
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
