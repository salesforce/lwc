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

function getter(target: Object, name: string): any {
    const value = target[name];
    if (isRendering) {
        subscribeToSetHook(vmBeingRendered, target, name);
    }
    return (value && typeof value === 'object') ? getPropertyProxy(value) : value;
}

function setter(target: Object, name: string, value: any): boolean {
    const oldValue = target[name];
    if (oldValue !== value) {
        target[name] = value;
        notifyListeners(target, name);
    }
    return true;
}

function deleteProperty(target: Object, name: string): boolean {
    delete target[name];
    notifyListeners(target, name);
    return true;
}

const propertyProxyHandler = {
    get: (target: Object, name: string): any => getter(target, name),
    set: (target: Object, name: string, newValue: any): boolean => setter(target, name, newValue),
    deleteProperty: (target: Object, name: string): boolean => deleteProperty(target, name),
};

export function getPropertyProxy(value: Object): any {
    if (value === null) {
        return null;
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

export function hookComponentLocalProperty(vm: VM, propName: string) {
    assert.vm(vm);
    const { cache: { component, privates } } = vm;
    const descriptor = getOwnPropertyDescriptor(component, propName);
    const { get, set, configurable } = descriptor;
    assert.block(() => {
        if (get || set || !configurable) {
            console.warn(`component ${vm} has a defined property ${propName} that cannot be watched for changes.`);
        }
    });
    if (configurable && !get && !set) {
        let { value, enumerable, writtable } = descriptor;
        privates[propName] = (value && typeof value === 'object') ? getPropertyProxy(value) : value;
        defineProperty(component, propName, {
            get: (): any => getter(privates, propName),
            set: (newValue: any): boolean => setter(privates, propName, newValue),
            configurable,
            enumerable,
            writtable,
        });
    }
}
