import assert from "./assert";
import {
    subscribeToSetHook,
    notifyListeners,
} from "./watcher";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker";
import { isUndefined, defineProperty, hasOwnProperty, toString, isArray, isObject, isNull } from "./language";

const ObjectPropertyToProxyCache: WeakMap<Object, Object> = new WeakMap();
const ProxyCache: WeakSet<Object> = new WeakSet(); // used to identify any proxy created by this piece of logic.

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

    // TODO: Provide a holistic way to deal with built-ins, right now we just care ignore Date
    if (isNull(value) || value.constructor === Date) {
        return value;
    }
    // TODO: perf opt - we should try to give identity to propertyProxies so we can test
    // them faster than a weakmap lookup.
    if (ProxyCache.has(value)) {
        return value;
    }

    assert.block(function devModeCheck() {
        const isNode = value instanceof Node;
        assert.invariant(!isNode, `Do not store references to DOM Nodes. Instead use \`this.querySelector()\` and \`this.querySelectorAll()\` to find the nodes when needed.`);
    });

    let proxy = ObjectPropertyToProxyCache.get(value);
    if (proxy) {
        return proxy;
    }
    proxy = new Proxy(value, propertyProxyHandler);
    ObjectPropertyToProxyCache.set(value, proxy);
    ProxyCache.add(proxy);
    return proxy;
}
const InstanceField = 0;
const RegularField = 1;
const ExpandoField = 2;
const MutatedField = 3;
const ObjectToFieldsMap = new WeakMap();

export function extractOwnFields(component: Object, allowInstanceFields: boolean): HashTable<number> {
    let fields = ObjectToFieldsMap.get(component);
    let type = allowInstanceFields ? InstanceField : ExpandoField;
    if (isUndefined(fields)) {
        // only the first batch are considered private fields
        type = RegularField;
        fields = {};
        ObjectToFieldsMap.set(component, fields);
    }
    for (let propName in component) {
        if (hasOwnProperty.call(component, propName) && isUndefined(fields[propName])) {
            fields[propName] = type;
            let value = component[propName];

            if (!allowInstanceFields) {
                // replacing the field with a getter and a setter to track the mutations
                // and provide meaningful errors
                defineProperty(component, propName, {
                    get: (): any => value,
                    set: (newValue: any) => {
                        value = newValue;
                        fields[propName] = MutatedField;
                    },
                    configurable: false,
                });
            }
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
