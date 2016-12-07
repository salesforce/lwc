// @flow

import assert from "./assert.js";
import { subscribeToSetHook } from "./watcher.js";
import {
    isRendering,
    vmBeingRendered,
    invokeComponentAttributeChangedCallback,
} from "./invoker.js";
import { updateComponentPropAndRehydrateWhenNeeded } from "./props.js";

const ObjectAttributeToProxyMap = new WeakMap();

const attributeProxyHandler = {
    get(target: Object, name: string): any {
        const value = target[name];
        if (isRendering) {
            subscribeToSetHook(vmBeingRendered, target, name);
        }
        return (value && typeof value === 'object') ? getAttributeProxy(value) : value;
    },
    set(target: Object, name: string, value: any) {
        assert.invariant(false, `Property ${name} of ${target} cannot be set to ${value} because it belongs to a decorated @attribute.`);
    },
};

export function getAttributeProxy(value: Object): any {
    if (value === null) {
        return null;
    }
    
    if (ObjectAttributeToProxyMap.has(value)) {
        return ObjectAttributeToProxyMap.get(value);
    }
    const proxy = new Proxy(value, attributeProxyHandler);
    ObjectAttributeToProxyMap.set(value, proxy);
    return proxy;   
}

export function setAttribute(vm: VM, attrName: string, newValue: any) {
    const { def: { attrs } } = vm;
    attrName = attrName.toLocaleLowerCase();
    const attrConfig = attrs[attrName];
    assert.isTrue(attrConfig, `${vm} does not have an attribute called ${attrName}.`);
    if (attrConfig) {
        updateComponentPropAndRehydrateWhenNeeded(vm, attrConfig.propName, newValue);
    }
}

export function removeAttribute(vm: VM, attrName: string) {
    const { def: { attrs } } = vm;
    attrName = attrName.toLocaleLowerCase();
    const attrConfig = attrs[attrName];
    assert.isTrue(attrConfig, `${vm} does not have an attribute called ${attrName}.`);
    if (attrConfig) {
        updateComponentPropAndRehydrateWhenNeeded(vm, attrConfig.propName, null);
    }
}

export function hasAttribute(vm: VM, attrName: string): boolean {
    const { def: { attrs } } = vm;
    attrName = attrName.toLocaleLowerCase();
    return !!attrs[attrName];
} 

export function getAttribute(vm: VM, attrName: string): any {
    const { def: { attrs }, state } = vm;
    attrName = attrName.toLocaleLowerCase();
    const attrConfig = attrs[attrName];
    assert.isTrue(attrConfig, `${vm} does not have an attribute called ${attrName}.`);
    return attrConfig ? state[attrConfig.propName] : null;
}

export function updateAttributeValueFromProp(vm: VM, propName: string, oldValue: any, newValue: any) {
    const { def: { props, attrs, observedAttrs } } = vm;
    const attrName = props[propName].attrName;
    assert.invariant(attrName, `Missing precomputed attribute name for prop ${propName} in ${vm}.`);
    assert.invariant(attrs[attrName], `Missing attribute configuration for ${attrName} in ${vm}.`);
    // TODO: when implementing web components, we will need to update vm.elm attribute accordingly
    if (observedAttrs[attrName]) {
        invokeComponentAttributeChangedCallback(vm, attrName, oldValue, newValue);
    }
}
