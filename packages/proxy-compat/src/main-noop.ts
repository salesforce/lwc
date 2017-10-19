import { getKey, callKey, setKey, deleteKey, inKey, iterableKey, instanceOfKey } from "./methods-noop";

let NOOP_COMPAT;

if (typeof Proxy === 'undefined') {
    NOOP_COMPAT = { getKey, callKey, setKey, deleteKey, inKey, iterableKey, instanceOfKey };
} else {
    // We can't use Object.assign because in IE11 does not exist (it will be polyfilled later)
    Proxy.getKey = getKey;
    Proxy.setKey = setKey;
    Proxy.callKey = callKey;
    Proxy.deleteKey = deleteKey;
    Proxy.inKey = inKey;
    Proxy.iterableKey = iterableKey;
    Proxy.instanceOfKey = instanceOfKey;
    NOOP_COMPAT = Proxy;
}

export default NOOP_COMPAT;
