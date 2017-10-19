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
    assign: _assign,
    keys: _keys,
    getOwnPropertyNames: _getOwnPropertyNames,
    hasOwnProperty: _hasOwnProperty,
    getOwnPropertyDescriptor: _getOwnPropertyDescriptor,
    preventExtensions: _preventExtensions,
    defineProperty: _defineProperty,
    isExtensible: _isExtensible,
    getPrototypeOf: _getPrototypeOf,
    setPrototypeOf: _setPrototypeOf
} = Object;
const _isArray = Array.isArray;

import { isCompatProxy } from './methods';

// Patched Functions:
function isArray(replicaOrAny: any): replicaOrAny is any[] {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny[ArraySlot] === ProxyIdentifier;
    }
    return _isArray(replicaOrAny);
}

function keys(replicaOrAny: any): Array<string> {
    if (isCompatProxy(replicaOrAny)) {
        const all = replicaOrAny.forIn(); // get all enumerables and filter by own
        var result = [], prop;
        for (let prop in all) {
            if (replicaOrAny.getOwnPropertyDescriptor(prop)) {
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

function getOwnPropertyNames(replicaOrAny: object): Array<string> {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.ownKeys(); // TODO: only strings
    }
    return _getOwnPropertyNames(replicaOrAny);
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

function assign(replicaOrAny: object): object {
    if (replicaOrAny == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }
    const to = Object(replicaOrAny);

    for (var index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
            if (isCompatProxy(nextSource)) {
                for (let nextKey in iterableKey(nextSource)) {
                    if (nextSource.getOwnPropertyDescriptor(nextKey)) {
                        setKey(to, nextKey, getKey(nextSource, nextKey));
                    }
                }
            } else {
                for (let nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed in regular objects
                    if (_hasOwnProperty.call(nextSource, nextKey)) {
                        setKey(to, nextKey, nextSource[nextKey]);
                    }
                }
            }
        }
    }
    return to;
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
Object.getOwnPropertyNames = getOwnPropertyNames;
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
Object.assign = assign;

// Patching Proxy (might contain some compat expandos already)
const OriginalProxy = typeof Proxy !== undefined ? Proxy : {};

_assign(XProxy, OriginalProxy, {
    getKey,
    callKey,
    setKey,
    deleteKey,
    inKey,
    iterableKey,
    instanceOfKey
});

export default class Proxy extends XProxy {
    static getKey = getKey;
    static callKey = callKey;
    static setKey = setKey;
    static deleteKey = deleteKey;
    static inKey = inKey;
    static iterableKey = iterableKey;
    static instanceOfKey = instanceOfKey;
}
