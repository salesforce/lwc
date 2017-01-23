import assert from "./assert.js";
import { subscribeToSetHook } from "./watcher.js";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker.js";

const ObjectAttributeToProxyMap = new WeakMap();
const ProxySet = new WeakSet();

const attributeProxyHandler = {
    get(target: Object, name: string): any {
        const value = target[name];
        if (isRendering) {
            subscribeToSetHook(vmBeingRendered, target, name);
        }
        return (value && typeof value === 'object') ? getAttributeProxy(value) : value;
    },
    set(target: Object, name: string, value: any) {
        assert.invariant(false, `Property ${name} of ${target.toString()} cannot be set to ${value} because it belongs to a decorated @attribute.`);
    },
};

export function getAttributeProxy(value: Object): any {
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
