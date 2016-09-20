// @flow

import { assert } from "./utils.js";

// this map can be used by the framework to construct the proxy per component class
export const MethodMap = new WeakMap();

export function getMethodConfig(component: Object, methodName: string): Object {
    const target = Object.getPrototypeOf(component);
    const config = MethodMap.get(target);
    return config && config[methodName];
}

export function decorator(config?: Object = {}): decorator {
    return function attribute(target: Object, methodName: string, descriptor: Object): Object {
        // for now, we need to use the runtime to inspect each class and
        // each attribute and keep track of them so we can use this
        // information later on to create proxies.
        let methods = MethodMap.get(target);
        if (!methods) {
            methods = {};
            MethodMap.set(target, methods);
        }
        if (!methods[methodName]) {
            methods[methodName] = config;
        }
        // setting up the descriptor for the public method
        descriptor.configurable = false;
        descriptor.enumerable = false;
        descriptor.writable = false;
        return descriptor;
    }
}
