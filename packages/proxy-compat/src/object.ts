import { getKey, setKey, isCompatProxy } from './methods';
const {
    concat: ArrayConcat
} = Array.prototype;

const {
    getOwnPropertyNames
} = Object;

export function patchedGetOwnPropertyNames(replicaOrAny: object): Array<string> {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.ownKeys().filter((key: PropertyKey) => key.constructor !== Symbol); // TODO: only strings
    }
    return getOwnPropertyNames(replicaOrAny);
}

// https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
// https://tc39.github.io/ecma262/#sec-ordinaryownpropertykeys
export function OwnPropertyKeys(O: any) {
    return ArrayConcat.call(Object.getOwnPropertyNames(O), Object.getOwnPropertySymbols(O));
}

export function patchedAssign(replicaOrAny: object): object {
    if (replicaOrAny == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }
    const to = Object(replicaOrAny);
    for (var index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            const keys = OwnPropertyKeys(nextSource);
            for(var i = 0; i < keys.length; i += 1) {
                const nextKey = keys[i];
                const descriptor = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                if (descriptor !== undefined && descriptor.enumerable === true) {
                    setKey(to, nextKey, getKey(nextSource, nextKey));
                }
            };
        }
    }
    return to;
}