// @flow

import { assert } from "./utils.js";

// this map can be used by the framework to construct the proxy per component class
const AttributeMap = new WeakMap();
const preventExtensions = Object.preventExtensions;

export function decorator(config?: Object = {}): decorator {
    return function attribute(target: Object, attrName: string, { initializer }: Object): Object {
        let attrs = AttributeMap.get(target);
        if (!attrs) {
            attrs = {};
            AttributeMap.set(target, attrs);
        }
        if (!attrs[attrName]) {
            attrs[attrName] = Object.create(config);
        }
        config.initializer = initializer;
        return {
            get: () => {
                throw new Error(`Invariant: component <${target.constructor.name}> can not access decorated @attribute ${attrName} until its updated() callback is invoked.`);
            },
            set: () => {
                throw new Error(`Invariant: component <${target.constructor.name}> can not set a new value for decorated @attribute ${attrName}.`);
            },
            enumerable: true,
            configurable: true
        };
    }
}

export function initComponentAttributes(vnode: Object, attrs: Object, bodyAttrValue: array<Object>) {
    const { component } = vnode;
    const target = Object.getPrototypeOf(component);
    const config = AttributeMap.get(target) || {};

    for (let attrName in config) {
        let { configurable, enumerable, initializer } = Object.getOwnPropertyDescriptor(component, attrName);
        assert(configurable, `Invariant: component ${vnode} has tampered with decorated @attribute ${attrName} during constructor() routine.`);
        Object.defineProperty(component, attrName, {
            get: (): any => attrs[attrName],
            set: () => {
                // TODO: consider two-ways data binding configuration
                throw new Error(`Invariant: component ${vnode} can not set a new value for decorated @attribute ${attrName}.`);
            },
            configurable: false,
            enumerable,
        });
        // default attribute value computed when needed
        if (!(attrName in attrs) && initializer) {
            attrs[attrName] = initializer();
        }
    }
    vnode.hasBodyAttribute = 'body' in config;
    if (bodyAttrValue.length > 0) {
        attrs.body = bodyAttrValue;
    }
    if (DEVELOPMENT) {
        for (let attrName in attrs) {
            assert(attrName in config, `component ${vnode} does not have decorated @attribute ${attrName}.`);
        }
        // TODO: maybe preventExtensions is not good enough if we want to be
        // more specific about the error in question.
        preventExtensions(attrs);
    }
}
