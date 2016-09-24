// @flow

import assert from "./assert.js";

// this map can be used by the framework to construct the proxy per component class
export const MethodMap = new WeakMap();

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
        assert.isFalse(methods[methodName], `Duplicated decorated method ${methodName} in component <${target.constructor.name}>.`);
        methods[methodName] = Object.create({}, config);
        assert.block(() => {
            Object.freeze(methods[methodName]);
        });
        // setting up the descriptor for the public method
        descriptor.configurable = false;
        descriptor.enumerable = false;
        descriptor.writable = false;
        return descriptor;
    }
}

export function getMethodsConfig(target: Object): Object {
    return MethodMap.get(target) || {};
}
