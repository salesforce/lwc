import assert from "./assert";
import { isUndefined, isObject, isArray, create, ArrayPush } from "./language";

import { Replicable } from "./membrane";
import { Context } from "./context";
import { Component } from "./component";
import { VNodeData } from "../3rdparty/snabbdom/types";
import { ComponentDef } from "./def";
import { VM } from "./vm";

export type ServiceCallback = (component: object, data: VNodeData, def: ComponentDef, context: Context) => void;
export type MembranePiercingCallback = (component: Component, data: VNodeData, def: ComponentDef, context: Context, target: Replicable, key: PropertyKey, value: any, callback: (newValue?: any) => void) => void;
export interface ServiceDef {
    connected?: ServiceCallback;
    disconnected?: ServiceCallback;
    rendered?: ServiceCallback;
    piercing?: MembranePiercingCallback;
}

export const Services: {
  connected?: ServiceCallback[];
  disconnected?: ServiceCallback[];
  rendered?: ServiceCallback[];
  piercing?: MembranePiercingCallback[];
} = create(null);

const hooks: Array<keyof ServiceDef> = ['rendered', 'connected', 'disconnected', 'piercing'];

export function register(service: ServiceDef) {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(service), `Invalid service declaration, ${service}: service must be an object`);
    }
    for (let i = 0; i < hooks.length; ++i) {
        const hookName = hooks[i];
        if (hookName in service) {
            let l = Services[hookName];
            if (isUndefined(l)) {
                Services[hookName] = l = [];
            }
            ArrayPush.call(l, service[hookName]);
        }
    }
}

export function invokeServiceHook(vm: VM, cbs: ServiceCallback[]) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vm(vm);
        assert.isTrue(isArray(cbs) && cbs.length > 0, `Optimize invokeServiceHook() to be invoked only when needed`);
    }
    const { component, data, def, context } = vm;
    for (let i = 0, len = cbs.length; i < len; ++i) {
        cbs[i].call(undefined, component, data, def, context);
    }
}
