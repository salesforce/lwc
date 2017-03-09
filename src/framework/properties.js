import assert from "./assert.js";
import {
    subscribeToSetHook,
    notifyListeners,
} from "./watcher.js";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker.js";
import {
    defineProperty,
    getOwnPropertyDescriptor,
} from "./language.js";

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
        assert.block(() => {
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

export function hookComponentLocalProperty(vm: VM, key: string | Symbol) {
    assert.vm(vm);
    const { component, privates } = vm;
    const descriptor = getOwnPropertyDescriptor(component, key);
    const { get, set, configurable } = descriptor;
    assert.block(() => {
        if (get || set || !configurable) {
            // TODO: classList is only really ignored when extending HTMLElement,
            // we should take that into consideration on this condition at some point.
            if (key !== 'classList') {
                console.warn(`component ${vm} has a property key ${key} that cannot be watched for changes.`);
            }
        }
    });
    if (configurable && !get && !set) {
        let { value, enumerable, writtable } = descriptor;
        privates[key] = (value && typeof value === 'object') ? getPropertyProxy(value) : value;
        defineProperty(component, key, {
            get: (): any => getter(privates, key),
            set: (newValue: any): boolean => setter(privates, key, newValue),
            configurable,
            enumerable,
            writtable,
        });
    }
}
