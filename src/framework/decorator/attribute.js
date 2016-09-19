// @flow

import { assert } from "../utils.js";

// this map can be used by the framework to construct the proxy per component class
const AttributeMap = new WeakMap();

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
        // -> nothing to be done for now
        return descriptor;
    }
}

export function getAttributesConfig(component: Object): Object {
    const proto = Object.getPrototypeOf(component);
    const attrs = AttributeMap.get(proto);
    assert(attrs, `Invariant: ${component} is an invalid component instance.`);
    return attrs;
}
