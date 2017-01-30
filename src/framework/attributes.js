import assert from "./assert.js";
import { subscribeToSetHook } from "./watcher.js";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker.js";
import { internal } from "./def.js";
import {
    getPrototypeOf,
    defineProperty,
    getOwnPropertyDescriptor,
} from "./language.js";

const ObjectAttributeToProxyMap = new WeakMap();
const ProxySet = new WeakSet();

function getter(target: Object, name: string): any {
    const value = target[name];
    if (isRendering) {
        subscribeToSetHook(vmBeingRendered, target, name);
    }
    return (value && typeof value === 'object') ? getAttributeProxy(value) : value;
}

function setter(target: Object, name: string, newValue: any) {
    assert.invariant(false, `Property ${name} of ${target.toString()} cannot be set to ${newValue} because it is a public property controlled by the owner element.`);
}

const attributeProxyHandler = {
    get: (target: Object, name: string): any => getter(target, name),
    set: (target: Object, name: string, newValue: any): any => setter(target, name, newValue),
};

function getAttributeProxy(value: Object): any {
    if (value === null) {
        return null;
    }
    assert.isTrue(typeof value === "object", "perf-optimization: avoid calling this method for non-object value.");
    if (ProxySet.has(value)) {
        return value;
    }

    if (ObjectAttributeToProxyMap.has(value)) {
        return ObjectAttributeToProxyMap.get(value);
    }
    const proxy = new Proxy(value, attributeProxyHandler);
    ObjectAttributeToProxyMap.set(value, proxy);
    ProxySet.add(proxy);
    return proxy;
}

export function hookComponentReflectiveProperty(vm: VM, propName: string) {
    const { cache: { component, state, def: { props: config } } } = vm;
    assert.block(() => {
        const target = getPrototypeOf(component);
        const { get, set } = getOwnPropertyDescriptor(component, propName) || getOwnPropertyDescriptor(target, propName);
        assert.invariant(get[internal] && set[internal], `component ${vm} has tampered with property ${propName} during construction.`);
    });
    defineProperty(component, propName, {
        get: (): any => getter(state, propName),
        set: (newValue: any): any => setter(state, propName, newValue),
        configurable: true,
        enumerable: true,
    });
    // this guarantees that the default value is always in place before anything else.
    const { initializer } = config[propName];
    const defaultValue = typeof initializer === 'function' ? initializer(): initializer;
    state[propName] = defaultValue;
}
