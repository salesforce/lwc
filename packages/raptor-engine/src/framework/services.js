import assert from "./assert.js";
import { isUndefined, isObject, isArray, create } from "./language.js";

const hooks = ['rehydrated', 'connected', 'disconnected'];

export const services: Services = create(null);

export function register(service: ServiceCallback) {
    if (!isObject(service)) {
        throw new TypeError(`Invalid service declaration, ${service}: service must be an object`);
    }
    for (let i = 0; i < hooks.length; ++i) {
        const hookName = hooks[i];
        if (hookName in service) {
            let l = services[hookName];
            if (isUndefined(l)) {
                services[hookName] = l = [];
            }
            l.push(service[hookName]);
        }
    }
}

export function invokeServiceHook(vm: VM, cbs: Array<ServiceCallback>) {
    assert.vm(vm);
    assert.isTrue(isArray(cbs) && cbs.length > 0, `Optimize invokeServiceHook() to be invoked only when needed`);
    const { component, data, def, context } = vm;
    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}
