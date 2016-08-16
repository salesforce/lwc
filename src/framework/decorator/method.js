// this map can be used by the framework to construct the proxy per component class
export const MethodMap = new WeakMap();

export default function method(config = {}) {
    return function decorator(target, methodName, descriptor) {
        // for now, we need to use the runtime to inspect each class and
        // each attribute and keep track of them so we can use this
        // information later on to create proxies.
        const proto = Object.getPrototypeOf(target);
        let methods = MethodMap.get(proto);
        if (!methods) {
            methods = {};
            MethodMap.set(proto, methods);
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
