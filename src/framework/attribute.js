// @flow

import assert from "./assert.js";
import { markVMAsDirty } from "./reactivity.js";
import { subscribeToSetHook } from "./watcher.js";
import {
    isRendering,
    vmBeingRendered,
} from "./invoker.js";

const AttributeMap = new WeakMap();
const internal = Symbol();
const ObjectAttributeToProxyMap = new WeakMap();

export function attribute(target: Object, attrName: string, { initializer }: Object): PropertyDescriptor {
    let attrs = AttributeMap.get(target);
    if (!attrs) {
        attrs = {};
        AttributeMap.set(target, attrs);
    }
    assert.isFalse(attrs[attrName], `Duplicated decorated attribute ${attrName} in component <${target.constructor.name}>.`);
    attrs[attrName] = { initializer };
    const get = () => {
        assert.fail(`Component <${target.constructor.name}> can not access decorated @attribute ${attrName} until its updated() callback is invoked.`);
    };
    const set = () => {
        assert.fail(`Component <${target.constructor.name}> can not set a new value for decorated @attribute ${attrName}.`);
    };
    assert.block(() => {
        get[internal] = true;
        set[internal] = true;
        Object.freeze(attrs[attrName]);
    });
    return {
        get,
        set,
        enumerable: true,
        configurable: true
    };
}

export function getAttributesConfig(target: Object): Object {
    return AttributeMap.get(target) || {};
}

export function initComponentAttributes(vm: Object, newAttrs: Object, newBody: array<Object>) {
    const { component, state, flags } = vm;
    const target = Object.getPrototypeOf(component);
    const config = AttributeMap.get(target) || {};
    for (let attrName in config) {
        let { initializer } = config[attrName];
        assert.block(() => {
            const { get, set } = Object.getOwnPropertyDescriptor(component, attrName) || Object.getOwnPropertyDescriptor(target, attrName);
            assert.invariant(get[internal] && set[internal], `component ${vm} has tampered with decorated @attribute ${attrName} during constructor() routine.`);
        });
        Object.defineProperty(component, attrName, {
            get: (): any => {
                const value = state[attrName];
                return (value && typeof value === 'object') ? getAttributeProxy(value) : value;
            },
            set: () => {
                assert.fail(`Component ${vm} can not set a new value for decorated @attribute ${attrName}.`);
            },
            configurable: true,
            enumerable: true,
        });
        // default attribute value computed when needed
        state[attrName] = attrName in newAttrs ? newAttrs[attrName] : (initializer && initializer());
    }
    flags.hasBodyAttribute = 'body' in config;
    if (newBody && newBody.length > 0) {
        state.body = newBody;
    }
    assert.block(() => {
        for (let attrName in newAttrs) {
            assert.isTrue(attrName in config, `Component ${vm} does not have decorated @attribute ${attrName}.`);
        }
        Object.preventExtensions(state);
    });
}

export function updateComponentAttributes(vm: Object, newAttrs: Object, newBody: array<Object>) {
    const { component, flags: { isDirty }, state } = vm;
    assert.invariant(!isRendering, `${vm}.render() method has side effects on the attributes received.`);
    const target = Object.getPrototypeOf(component);
    const config = AttributeMap.get(target) || {};
    for (let attrName in config) {
        let attrValue;
        if (!(attrName in newAttrs)) {
            // default attribute value computed when needed
            const initializer = config[attrName];
            attrValue = initializer && initializer();
        } else {
            attrValue = newAttrs[attrName];
        }
        if (state[attrName] !== attrValue) {
            state[attrName] = attrValue;
            if (!isDirty) {
                markVMAsDirty(vm, `@${attrName}`);
            }
        }
    }
    if (state.body !== newBody && newBody && newBody.length > 0) {
        state.body = newBody;
        if (!isDirty) {
            markVMAsDirty(vm, '@body');
        }
    }
    assert.block(() => {
        for (let attrName in state) {
            assert.isTrue(attrName in config, `Component ${vm} does not have decorated @attribute ${attrName}.`);
        }
    });
}

const attributeProxyHandler = {
    get(target: Object, name: String): any {
        const value = target[name];
        if (isRendering) {
            subscribeToSetHook(vmBeingRendered, target, name);
        }
        return (value && typeof value === 'object') ? getAttributeProxy(value) : value;
    },
    set(target: Object, name: String, value: any) {
        assert.invariant(false, `Property ${name} of ${target} cannot be set to ${value} because it belongs to a decorated @attribute.`);
    },
};

function getAttributeProxy(value: Object): Object {
    if (value === null) {
        return null;
    }
    if (ObjectAttributeToProxyMap.has(value)) {
        return ObjectAttributeToProxyMap.get(value);
    }
    ObjectAttributeToProxyMap.set(value, new Proxy(value, attributeProxyHandler));
}
