import {
    ProxySlot,
    ProxyIdentifier,
    inOperator,
} from "./xproxy";

export function isCompatProxy(replicaOrAny: any): replicaOrAny is XProxy {
    return replicaOrAny && replicaOrAny[ProxySlot] === ProxyIdentifier;
}


export function getKey(replicaOrAny: any, key: PropertyKey): any {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.get(key);
    }
    return replicaOrAny[key];
}

export function callKey(replicaOrAny: any, key: PropertyKey, ...args: Array<any>): any {
    const fn = getKey(replicaOrAny, key);
    return fn.apply(replicaOrAny, args);
}

export function setKey(replicaOrAny: any, key: PropertyKey, newValue: any, originalReturnValue?: any): any {
    if (isCompatProxy(replicaOrAny)) {
        replicaOrAny.set(key, newValue);
    } else {
        replicaOrAny[key] = newValue;
    }
    return arguments.length === 4 ? originalReturnValue : newValue;
}

export function deleteKey(replicaOrAny: any, key: PropertyKey) {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.deleteProperty(key);
    }
    delete replicaOrAny[key];
}

export function inKey(replicaOrAny: any, key: PropertyKey): boolean {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.has(key);
    }
    return inOperator(replicaOrAny, key);
}

export function iterableKey(replicaOrAny: any): any[] {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.forIn();
    }
    return replicaOrAny;
}
