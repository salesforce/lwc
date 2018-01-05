import { compatPush, isArray, compatConcat, compatUnshift } from './array';
import { compatHasOwnProperty } from './object';
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
import { setPrototypeOf as setPrototypeOfPolyfill } from './polyfills/set-prototype-of';

if (!Object.setPrototypeOf || !({__proto__:[]} instanceof Array)) {
    Object.setPrototypeOf = setPrototypeOfPolyfill;
}

const {
    keys: _keys,
    getOwnPropertyDescriptor: _getOwnPropertyDescriptor,
    preventExtensions: _preventExtensions,
    defineProperty: _defineProperty,
    isExtensible: _isExtensible,
    getPrototypeOf: _getPrototypeOf,
    setPrototypeOf: _setPrototypeOf
} = Object;

import { patchedAssign, patchedGetOwnPropertyNames } from './object';

import { isCompatProxy } from './methods';

const {
    shift: ArrayShift,
    slice: ArraySlice,
    unshift: ArrayUnshift,
    push: ArrayPush,
    concat: ArrayConcat
} = Array.prototype;


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


// patches
// [*] Object.prototype.hasOwnProperty should be patched as a general rule
// [ ] Object.propertyIsEnumerable should be patched
// [*] Array.isArray
Object.prototype.hasOwnProperty = compatHasOwnProperty;
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

// Object methods path
Object.compatKeys = keys;

// Array.prototype methods patches.
Object.defineProperties(Array.prototype, {
    compatUnshift: { value: compatUnshift, enumerable: false },
    compatConcat: { value: compatConcat, enumerable: false },
    compatPush: { value: compatPush, enumerable: false },
});

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
