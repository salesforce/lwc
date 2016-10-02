// @flow

import {
    currentContext,
    establishContext,
} from "./context.js";

export function invokeComponentDetachMethod(vnode: Object) {
    const { component } = vnode;
    if (component.detach) {
        const ctx = currentContext;
        establishContext(this);
        component.detach(vnode.elm);
        establishContext(ctx);
    }
}

export function invokeComponentAttachMethod(vnode: Object) {
    const { component } = vnode;
    if (component.attach) {
        const ctx = currentContext;
        establishContext(this);
        component.attach(vnode.elm);
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vnode: Object): Object {
    const { component, api } = vnode;
    if (component.render) {
        const ctx = currentContext;
        establishContext(this);
        vnode.isRendering = true;
        const newVnode = component.render(api);
        vnode.isRendering = false;
        establishContext(ctx);
        return newVnode;
    }
    return null;
}

export function invokeComponentUpdatedMethod(vnode: Object) {
    const { component } = vnode;
    if (component.updated) {
        const ctx = currentContext;
        establishContext(this);
        component.updated();
        establishContext(ctx);
    }
}
