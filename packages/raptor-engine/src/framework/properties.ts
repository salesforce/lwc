import assert from "./assert";
import {
    subscribeToSetHook,
    notifyListeners,
} from "./watcher";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker";
import { isUndefined, defineProperty, hasOwnProperty, toString, isArray, isObject } from "./language";

const ObjectPropertyToProxyCache: Map<Object, Object> = new WeakMap();
const ProxyCache: Set<Object> = new WeakSet(); // used to identify any proxy created by this piece of logic.

function propertyGetter(target: Object, key: string | Symbol): any {
    const value = target[key];
    if (isRendering && vmBeingRendered) {
        subscribeToSetHook(vmBeingRendered, target, key);
    }
    return (value && isObject(value)) ? getPropertyProxy(value) : value;
}

function propertySetter(target: Object, key: string | Symbol, value: any): boolean {
    if (isRendering) {
        assert.logError(`Setting property "${toString(key)}" of ${toString(target)} during the rendering process of ${vmBeingRendered} is invalid. The render phase must have no side effects on the state of any component.`);
        return false;
    }
    const oldValue = target[key];
    if (oldValue !== value) {
        target[key] = value;
        notifyListeners(target, key);
    } else if (key === 'length' && isArray(target)) {
        // fix for issue #236: push will add the new index, and by the time length
        // is updated, the internal length is already equal to the new length value
        // therefore, the oldValue is equal to the value. This is the forking logic
        // to support this use case.
        notifyListeners(target, key);
    }
    return true;
}

function propertyDelete(target: Object, key: string | Symbol): boolean {
    delete target[key];
    notifyListeners(target, key);
    return true;
}

const propertyProxyHandler = {
    get: propertyGetter,
    set: propertySetter,
    deleteProperty: propertyDelete,
};

export function getPropertyProxy(value: Object): any {
    assert.isTrue(isObject(value), "perf-optimization: avoid calling this method for non-object value.");
    if (value === null) {
        return value;
    }
    // TODO: perf opt - we should try to give identity to propertyProxies so we can test
    // them faster than a weakmap lookup.
    if (ProxyCache.has(value)) {
        return value;
    }
    // TODO: optimize this check
    // TODO: and alternative here is to throw a hard error in dev mode so in prod we don't have to do the check
    if (value instanceof Node) {
        assert.logWarning(`Do not store references to DOM Nodes. Instead use \`this.querySelector()\` and \`this.querySelectorAll()\` to find the nodes when needed.`);
        return value;
    }
    let proxy = ObjectPropertyToProxyCache.get(value);
    if (proxy) {
        return proxy;
    }
    proxy = new Proxy(value, propertyProxyHandler);
    ObjectPropertyToProxyCache.set(value, proxy);
    ProxyCache.add(proxy);
    return proxy;
}

const RegularField = 1;
const ExpandoField = 2;
const MutatedField = 3;
const ObjectToFieldsMap = new WeakMap();

export function extractOwnFields(target: Object): HashTable<number> {
    let fields = ObjectToFieldsMap.get(target);
    let type = ExpandoField;
    if (isUndefined(fields)) {
        // only the first batch are considered private fields
        type = RegularField;
        fields = {};
        ObjectToFieldsMap.set(target, fields);
    }
    for (let propName in target) {
        if (hasOwnProperty.call(target, propName) && isUndefined(fields[propName])) {
            fields[propName] = type;
            let value = target[propName];
            // replacing the field with a getter and a setter to track the mutations
            // and provide meaningful errors
            defineProperty(target, propName, {
                get: (): any => value,
                set: (newValue: any) => {
                    value = newValue;
                    fields[propName] = MutatedField;
                },
                configurable: false,
            });
        }
    }
    return fields;
}

export function getOwnFields(target: Object): HashTable<number> {
    let fields = ObjectToFieldsMap.get(target);
    if (isUndefined(fields)) {
        fields = {};
    }
    return fields;
}
