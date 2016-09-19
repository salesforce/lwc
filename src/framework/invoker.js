// @flow

import {
    currentContext,
    establishContext,
} from "./context.js";

export function invokeComponentDetachMethod(vnode: Object) {
    if (vnode.component.detach) {
        const ctx = currentContext;
        establishContext(this);
        vnode.component.detach(vnode.domNode);
        establishContext(ctx);
    }
}

export function invokeComponentAttachMethod(vnode: Object) {
    if (vnode.component.attach) {
        const ctx = currentContext;
        establishContext(this);
        vnode.component.attach(vnode.domNode);
        establishContext(ctx);
    }
}

export function invokeComponentRenderMethod(vnode: Object): Object {
    if (vnode.component.render) {
        const ctx = currentContext;
        establishContext(this);
        vnode.isRendering = true;
        const newElement = vnode.component.render(vnode.api);
        vnode.isRendering = false;
        establishContext(ctx);
        return newElement;
    }
    return null;
}

export function invokeComponentUpdatedMethod(vnode: Object) {
    if (vnode.component.updated) {
        const ctx = currentContext;
        establishContext(this);
        vnode.component.updated();
        establishContext(ctx);
    }
}
