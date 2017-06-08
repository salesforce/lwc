import assert from "./assert";
import { isUndefined, isObject, isArray, create } from "./language";
import { Replicable } from "./membrane"; // eslint-disable-line no-unused-vars

const hooks = ['wiring', 'rehydrated', 'connected', 'disconnected', 'piercing'];

export type ServiceCallback = (component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>) => void; // eslint-disable-line no-undef
export type MembranePiercingCallback = (component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>, target: Replicable, key: Symbol | string, value: any, callback: (newValue?: any) => void) => void; // eslint-disable-line no-undef

export const Services: {
  wiring?: ServiceCallback[];
  connected?: ServiceCallback[];
  disconnected?: ServiceCallback[];
  rehydrated?: ServiceCallback[];
  piercing?: MembranePiercingCallback[];
} = create(null);

export function register(service: ServiceCallback) {
    assert.isTrue(isObject(service), `Invalid service declaration, ${service}: service must be an object`);
    for (let i = 0; i < hooks.length; ++i) {
        const hookName = hooks[i];
        if (hookName in service) {
            let l = Services[hookName];
            if (isUndefined(l)) {
                Services[hookName] = l = [];
            }
            l.push(service[hookName]);
        }
    }
}

export function invokeServiceHook(vm: VM, cbs: Array<ServiceCallback>) {
    assert.vm(vm);
    assert.isTrue(isArray(cbs) && cbs.length > 0, `Optimize invokeServiceHook() to be invoked only when needed`);
    const { component, vnode: { data }, def, context } = vm;
    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}
