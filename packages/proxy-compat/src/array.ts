import { isCompatProxy, setKey, getKey, deleteKey } from './methods';
import { compatHasOwnProperty } from './object';
import { ProxyIdentifier, ArraySlot } from "./xproxy";

const _isArray = Array.isArray;


const {
    slice: ArraySlice,
    shift: ArrayShift,
    unshift: ArrayUnshift,
} = Array.prototype;

// Patched Functions:
export function isArray(replicaOrAny: any): replicaOrAny is any[] {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny[ArraySlot] === ProxyIdentifier;
    }
    return _isArray(replicaOrAny);
}

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.7
export function compatPush (this: any) {
    const O = Object(this);
    let n = O.length;
    let items = ArraySlice.call(arguments);
    while(items.length) {
        const E = ArrayShift.call(items);
        setKey(O, n, E);
        n += 1;
    }
    O.length = n;
    return O.length;
}

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.4
export function compatConcat (this: any) {
    const O = Object(this);
    const A = [];
    let N = 0;
    const items = ArraySlice.call(arguments);
    ArrayUnshift.call(items, O);
    while(items.length) {
        const E = ArrayShift.call(items);
        if (isArray(E)) {
            let k = 0;
            let length = E.length;
            for(k; k < length; k += 1, N += 1) {
                const subElement = getKey(E, k);
                A[N] = subElement;
            }
        } else {
            A[N] = E;
            N += 1;
        }
    }
    return A;

}

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.13
export function compatUnshift (this: any): number {
    const O = Object(this);
    const len = O.length;
    const argCount = arguments.length;
    let k = len;
    while (k > 0) {
        const from = k - 1;
        const to = k + argCount - 1;
        const fromPresent = compatHasOwnProperty.call(O, from);
        if (fromPresent) {
            const fromValue = O[from];
            setKey(O, to, fromValue);
        } else {
            deleteKey(O, to);
        }
        k -= 1;
    }
    let j = 0;
    let items = ArraySlice.call(arguments);
    while(items.length) {
        const E = ArrayShift.call(items);
        setKey(O, j, E);
        j += 1;
    }
    O.length = len + argCount;
    return O.length;
}