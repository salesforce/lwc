import {
    getContext,
    currentContext,
} from "./context.js";

import {
    renderComponent,
} from "./rendering.js";

import {
    opaqueToComponentMap,
    isValidElement,
} from "./createElement.js";

export function mountToDom(opaque, domNode) {
    if (opaque === null) {
        throw new Error('...');
    }
    const component = opaqueToComponentMap.get(opaque);
    if (!component) {
        throw new Error(`Invariant Violation: $A.mountToDom(): Invalid component element ${opaque}.`);
    }
    const ctx = getContext(component);
    if (ctx.isMounted) {
        throw new Error(`Invariant Violation: $A.mountToDom(): Component element can only be mounted once.`);
    }
    if (!ctx.isRendered) {
        renderComponent(component);
    }
    console.log(component, domNode);
    throw new Error('TBI');
}

export function unmountFromDom(opaque) {
    throw new Error('TBI');
}
