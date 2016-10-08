// @flow

///<reference path="types.d.ts"/>

import {
    currentContext,
    establishContext,
} from "./context.js";
import {
    makeComponentPropertiesInactive,
} from "./reactivity.js";
import {
    addComponentWatchers,
} from "./watcher.js";

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
    const { component, api, flags } = vm;
    if (component.render) {
        const ctx = currentContext;
        establishContext(this);
        flags.isRendering = true;
        makeComponentPropertiesInactive(vm);
        addComponentWatchers(vm);
        const vnode = component.render(api);
        flags.isRendering = false;
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
