// this map can be used by the framework to construct the proxy per component class
export const AttributeMap = new WeakMap();

import {
    markComponentAsDirty,
} from "./rendering.js";

export default function attribute(config = {}) {
    return function decorator(target, key, descriptor) {
        // for now, we need to use the runtime to inspect each class and
        // each attribute and keep track of them so we can use this
        // information later on to create proxies.
        const proto = Object.getPrototypeOf(target);
        let attrs = AttributeMap.get(proto);
        if (!attrs) {
            attrs = {};
            AttributeMap.set(proto, attrs);
        }
        if (!attrs[key]) {
            attrs[key] = config;
        }
        // setting up the descriptor's getter and setter for the public attribute
        let value = target[key];
        descriptor.configurable = false;
        if (!descriptor.get) {
            descriptor.get = () => value;
            descriptor.set = (newValue) => {
                value = newValue;
                if (value !== newValue) {
                    value = newValue;
                    markComponentAsDirty(target, key);
                }
            };
        }
        return descriptor;
    }
}
