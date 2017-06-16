import assert from "./assert";
import { isUndefined, isObject, isArray, create } from "./language";

const hooks = ['wiring', 'rehydrated', 'connected', 'disconnected', 'piercing'];

/* eslint-disable */
import { Replicable } from "./membrane";
export type ServiceCallback = (component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>) => void;
export type MembranePiercingCallback = (component: Component, data: VNodeData, def: ComponentDef, context: HashTable<any>, target: Replicable, key: Symbol | string, value: any, callback: (newValue?: any) => void) => void;
export type ServiceDef = { wiring?: ServiceCallback; connected?: ServiceCallback; disconnected?: ServiceCallback; rehydrated?: ServiceCallback; piercing?: MembranePiercingCallback; [key: string]: ServiceCallback | MembranePiercingCallback | undefined; };
/* eslint-enable */

export const Services: {
  wiring?: ServiceCallback[];
  connected?: ServiceCallback[];
  disconnected?: ServiceCallback[];
  rehydrated?: ServiceCallback[];
  piercing?: MembranePiercingCallback[];
  [key: string]: ServiceCallback[] | MembranePiercingCallback[] | undefined;
} = create(null);

export function register(service: ServiceDef) {
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
