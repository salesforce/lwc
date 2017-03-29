import assert from "./assert.js";
import {
    subscribeToSetHook,
    notifyListeners,
} from "./watcher.js";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker.js";
import { isUndefined, defineProperty, toString } from "./language.js";

const ObjectPropertyToProxyMap = new WeakMap();
const ProxySet = new WeakSet();

function getter(target: Object, key: string | Symbol): any {
    const value = target[key];
    if (isRendering && vmBeingRendered) {
        subscribeToSetHook(vmBeingRendered, target, key);
    }
    return (value && typeof value === 'object') ? getPropertyProxy(value) : value;
}

function setter(target: Object, key: string | Symbol, value: any): boolean {
    if (isRendering) {
        // TODO: should this be an error? or a console.error?
        throw new Error(`Setting property \`${toString(key)}\` of ${toString(target)} during the rendering process of ${vmBeingRendered} is invalid. The render phase should have no side effects on the state of any component.`);
    }
    const oldValue = target[key];
    if (oldValue !== value) {
        target[key] = value;
        notifyListeners(target, key);
    }
    return true;
}

function deleteProperty(target: Object, key: string | Symbol): boolean {
    delete target[key];
    notifyListeners(target, key);
    return true;
}

const propertyProxyHandler = {
    get: (target: Object, key: string | Symbol): any => getter(target, key),
    set: (target: Object, key: string | Symbol, newValue: any): boolean => setter(target, key, newValue),
    deleteProperty: (target: Object, key: string | Symbol): boolean => deleteProperty(target, key),
};

export function getPropertyProxy(value: Object): any {
    if (value === null) {
        return value;
    }
    if (value instanceof Node) {
        assert.block(function devModeCheck() {
            console.warn(`Storing references to DOM Nodes in general is discoraged. Instead, use querySelector and querySelectorAll to find the elements when needed. TODO: provide a link to the full explanation.`);
        });
        return value;
    }
    assert.isTrue(typeof value === "object", "perf-optimization: avoid calling this method for non-object value.");
    if (ProxySet.has(value)) {
        return value;
    }

    if (ObjectPropertyToProxyMap.has(value)) {
        return ObjectPropertyToProxyMap.get(value);
    }
    const proxy = new Proxy(value, propertyProxyHandler);
    ObjectPropertyToProxyMap.set(value, proxy);
    ProxySet.add(proxy);
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