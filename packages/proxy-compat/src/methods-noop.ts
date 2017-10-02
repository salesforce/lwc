
export function getKey(replicaOrAny: any, key: PropertyKey): any {
    return replicaOrAny[key];
}

export function callKey(replicaOrAny: any, key: PropertyKey, ...args: Array<any>): any {
    return replicaOrAny[key].apply(replicaOrAny, args);
}

export function setKey(replicaOrAny: any, key: PropertyKey, newValue: any, originalReturnValue?: any): any {
    const returnValue = replicaOrAny[key] = newValue;
    return arguments.length === 4 ? originalReturnValue : returnValue;
}

export function deleteKey(replicaOrAny: any, key: PropertyKey) {
    delete replicaOrAny[key];
}

export function inKey(replicaOrAny: any, key: PropertyKey): boolean {
    return key in replicaOrAny;
}

export function iterableKey(replicaOrAny: any): any[] {
    return replicaOrAny;
}
