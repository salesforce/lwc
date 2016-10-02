// @flow

import {
    currentContext,
    establishContext,
} from "./context.js";

export function invokeComponentDetachMethod(vm: Object) {
    const { component } = vm;
    if (component.detach) {
        const ctx = currentContext;
        establishContext(this);
        component.detach(vm.elm);
        establishContext(ctx);
    }
}

export function invokeComponentAttachMethod(vm: Object) {
    const { component } = vm;
    if (component.attach) {
        const ctx = currentContext;
        establishContext(this);
        component.attach(vm.elm);
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vm: Object): Object {
    const { component, api } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(this);
        vm.isRendering = true;
        vm.reactiveNames = {};
        const vnode = component.render(api);
        vm.isRendering = false;
        establishContext(ctx);
        return vnode;
    }
    return null;
}

export function invokeComponentUpdatedMethod(vm: Object) {
    const { component } = vm;
    if (component.updated) {
        const ctx = currentContext;
        establishContext(this);
        component.updated();
        establishContext(ctx);
    }
}
