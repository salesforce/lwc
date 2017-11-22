import {
    getKey,
    callKey,
    setKey,
    deleteKey,
    inKey,
    iterableKey,
    instanceOfKey,
    compatGetKey,
    compatCallKey,
    compatSetKey,
    compatDeleteKey,
    compatInKey,
    compatIterableKey
} from "./methods";
import { XProxy, ProxySlot, ProxyIdentifier, ArraySlot, XProxyInstance } from "./xproxy";

const {
    keys: _keys,
    hasOwnProperty: _hasOwnProperty,
    getOwnPropertyDescriptor: _getOwnPropertyDescriptor,
    preventExtensions: _preventExtensions,
    defineProperty: _defineProperty,
    isExtensible: _isExtensible,
    getPrototypeOf: _getPrototypeOf,
    setPrototypeOf: _setPrototypeOf
} = Object;
const _isArray = Array.isArray;

import { patchedAssign, patchedGetOwnPropertyNames } from './object';

import { isCompatProxy } from './methods';

const {
    shift: ArrayShift,
    slice: ArraySlice,
    unshift: ArrayUnshift,
    push: ArrayPush,
    concat: ArrayConcat
} = Array.prototype;

// Patched Functions:
function isArray(replicaOrAny: any): replicaOrAny is any[] {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny[ArraySlot] === ProxyIdentifier;
    }
    return _isArray(replicaOrAny);
}

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.4
function compatConcat (this: any) {
    if (!isCompatProxy(this)) {
        return ArrayConcat.apply(this, arguments);
    }
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
function compatUnshift (this: any): number {
    if (!isCompatProxy(this)) {
        return ArrayUnshift.apply(this, arguments);
    }
    const O = Object(this);
    const len = O.length;
    const argCount = arguments.length;
    let k = len;
    while (k > 0) {
        const from = k - 1;
        const to = k + argCount - 1;
        const fromPresent = hasOwnProperty.call(O, from);
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

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.7
function compatPush (this: any) {
    if (!isCompatProxy(this)) {
        return ArrayPush.apply(this, arguments);
    }
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

function keys(replicaOrAny: any): Array<string> {
    if (isCompatProxy(replicaOrAny)) {
        const all = replicaOrAny.forIn(); // get all enumerables and filter by own
        var result = [], prop;
        for (let prop in all) {
            const desc = replicaOrAny.getOwnPropertyDescriptor(prop);
            if (desc && desc.enumerable === true) {
                result.push(prop);
            }
        }
        return result;
    }
    return _keys(replicaOrAny);
}

function getPrototypeOf(replicaOrAny: object): object | null {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.getPrototypeOf();
    }
    return _getPrototypeOf(replicaOrAny);
}

function setPrototypeOf(replicaOrAny: object, proto: object): boolean {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.setPrototypeOf(proto);
    }
    return _setPrototypeOf(replicaOrAny, proto);
}

function getOwnPropertyDescriptor(replicaOrAny: object, key: PropertyKey) {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.getOwnPropertyDescriptor(key);
    }
    return _getOwnPropertyDescriptor(replicaOrAny, key);
}

function preventExtensions(replicaOrAny: any): any {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.preventExtensions();
    }
    return _preventExtensions(replicaOrAny);
}

function isExtensible(replicaOrAny: object) {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.isExtensible();
    }
    return _isExtensible(replicaOrAny);
}

function defineProperty(replicaOrAny: object, key: PropertyKey, descriptor: PropertyDescriptor) {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.defineProperty(key, descriptor);
    }
    return _defineProperty(replicaOrAny, key, descriptor);
}

function hasOwnProperty(this: any, key: string | symbol): boolean {
    if (isCompatProxy(this)) {
        return !!this.getOwnPropertyDescriptor(key);
    }
    return _hasOwnProperty.call(this, key);
}

// patches
// [*] Object.prototype.hasOwnProperty should be patched as a general rule
// [ ] Object.propertyIsEnumerable should be patched
// [*] Array.isArray
Object.prototype.hasOwnProperty = hasOwnProperty;
Array.isArray = isArray;

// trap `preventExtensions` can be covered by a patched version of:
// [*] Object.preventExtensions()
// [ ] Reflect.preventExtensions()

// trap `getOwnPropertyDescriptor` can be covered by a patched version of:
// [*] Object.getOwnPropertyDescriptor()
// [ ] Reflect.getOwnPropertyDescriptor()

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
// trap `defineProperty` can be covered by a patched version of:
// [*] Object.defineProperty()
// [ ] Reflect.defineProperty()


// trap `deleteProperty` can be covered by the transpilation and the patched version of:
// [ ] Reflect.deleteProperty()

// trap `ownKeys` can be covered by a patched version of:
// [*] Object.getOwnPropertyNames()
// [ ] Object.getOwnPropertySymbols()
// [*] Object.keys()
// [ ] Reflect.ownKeys()
Object.defineProperty = defineProperty;
Object.preventExtensions = preventExtensions;
Object.getOwnPropertyDescriptor = getOwnPropertyDescriptor;
Object.getOwnPropertyNames = patchedGetOwnPropertyNames;
Object.keys = keys;
Object.isExtensible = isExtensible;
// trap `getPrototypeOf` can be covered by a patched version of:
// [x] Object.setPrototypeOf()
// [ ] Reflect.setPrototypeOf()

// trap `getPrototypeOf` can be covered by a patched version of:
// [x] Object.getPrototypeOf()
// [ ] Reflect.getPrototypeOf()
Object.setPrototypeOf = setPrototypeOf;
Object.getPrototypeOf = getPrototypeOf;

// Other necessary patches:
// [*] Object.assign
Object.assign = patchedAssign;

Array.prototype.unshift = compatUnshift;
Array.prototype.concat = compatConcat;
Array.prototype.push = compatPush;

function overrideProxy() {
    return Proxy.__COMPAT__;
}

// At this point Proxy can be the real Proxy (function) a noop-proxy (object with noop-keys) or undefined
let FinalProxy = typeof Proxy !== 'undefined' ? Proxy : {};

if (typeof FinalProxy !== 'function' || overrideProxy()) {
    FinalProxy = class Proxy extends XProxy {};
}

FinalProxy.getKey = getKey;
FinalProxy.callKey = callKey;
FinalProxy.setKey = setKey;
FinalProxy.deleteKey = deleteKey;
FinalProxy.inKey = inKey;
FinalProxy.iterableKey = iterableKey;
FinalProxy.instanceOfKey = instanceOfKey;

export default FinalProxy;
