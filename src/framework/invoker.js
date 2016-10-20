// @flow

///<reference path="types.d.ts"/>

import {
    currentContext,
    establishContext,
} from "./context.js";

export let isRendering: Boolean = false;
export let vmBeingRendered: VM|null = null;

export function invokeComponentDetachMethod(vm: VM) {
    const { component } = vm;
    if (component.detach) {
        const ctx = currentContext;
        establishContext(this);
        component.detach(vm.elm);
        establishContext(ctx);
    }
}

export function invokeComponentAttachMethod(vm: VM) {
    const { component } = vm;
    if (component.attach) {
        const ctx = currentContext;
        establishContext(this);
        component.attach(vm.elm);
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vm: VM): VNode {
    const { component, api } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(this);
        isRendering = true;
        vmBeingRendered = vm;
        const vnode = component.render(api);
        isRendering = false;
        vmBeingRendered = null;
        establishContext(ctx);
        return vnode;
    }
    return null;
}

export function invokeComponentUpdatedMethod(vm: VM) {
    const { component } = vm;
    if (component.updated) {
        const ctx = currentContext;
        establishContext(this);
        component.updated();
        establishContext(ctx);
    }
}
