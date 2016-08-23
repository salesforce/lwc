// @flow

import {
    getContext,
    establishContext,
    currentContext,
} from "./context.js";

function invokeComponentDetachMethod(component: Object) {
    if (component.detach) {
        const outerContext = currentContext;
        const ctx = getContext(component);
        establishContext(ctx);
        component.detach(ctx.tree);
        establishContext(outerContext);
    }
}

export function dismountComponent(component: Object) {
    const ctx = getContext(component);
    const {childComponent, isMounted} = ctx;
    if (!isMounted) {
        throw new Error(`Assert: Component element must be mounted.`);
    }
    // TODO: we might want to inverse this to dismounting childComponent before component
    invokeComponentDetachMethod(component);
    if (childComponent) {
        dismountComponent(childComponent);
    }
    ctx.isMounted = false;
}
