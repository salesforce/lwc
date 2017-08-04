import { getKey, callKey, setKey, deleteKey, inKey, iterableKey } from "./methods";
import { XProxy, ProxySlot, ProxyIdentifier } from "./xproxy";

const {
    assign: _assign,
    keys: _keys,
    getOwnPropertyNames: _getOwnPropertyNames,
    hasOwnProperty: _hasOwnProperty,
} = Object;
const _isArray = Array.isArray;

function isCompatProxy(replicaOrAny: any) {
    return replicaOrAny && replicaOrAny[ProxySlot] === ProxyIdentifier;
}

// Patched Functions:
function isArray(replicaOrAny: any): replicaOrAny is any[] {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.length === ProxyIdentifier;
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

function getOwnPropertyNames(replicaOrAny: object): Array<string> {
    if (isCompatProxy(replicaOrAny)) {
        return replicaOrAny.ownKeys(); // TODO: only strings
    }
    return _getOwnPropertyNames(replicaOrAny);
}

function hasOwnProperty(key: string | symbol): boolean {
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
// [ ] Object.preventExtensions()
// [ ] Reflect.preventExtensions()

// trap `getOwnPropertyDescriptor` can be covered by a patched version of:
// [ ] Object.getOwnPropertyDescriptor()
// [ ] Reflect.getOwnPropertyDescriptor()

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty
// trap `defineProperty` can be covered by a patched version of:
// [ ] Object.defineProperty()
// [ ] Reflect.defineProperty()


// trap `deleteProperty` can be covered by the transpilation and the patched version of:
// [ ] Reflect.deleteProperty()

// trap `ownKeys` can be covered by a patched version of:
// [*] Object.getOwnPropertyNames()
// [ ] Object.getOwnPropertySymbols()
// [*] Object.keys()
// [ ] Reflect.ownKeys()
Object.getOwnPropertyNames = getOwnPropertyNames;
Object.keys = keys;

// trap `isExtensible` can be covered by a patched version of:
// [ ] Object.isExtensible()
// [ ] Reflect.isExtensible()

// trap `setPrototypeOf` can be covered by a patched version of:
// [ ] Object.setPrototypeOf()
// [ ] Reflect.setPrototypeOf()

// Other necessary patches:
// [*] Object.assign
Object.assign = assign;

// Patching Proxy
_assign(XProxy, {
    getKey,
    callKey,
    setKey,
    deleteKey,
    inKey,
    iterableKey,
});

export default XProxy;
