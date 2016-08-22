/* @flow */
import {
    getContext,
} from "./context.js";

import {
    computeTree,
    renderComponent,
} from "./rendering.js";

import {
    opaqueToComponentMap,
} from "./createElement.js";

import {
    append,
} from "dom";

export function mountToDom(opaque: Object, domNode: Node) {
    const component = opaque && opaqueToComponentMap.get(opaque);
    if (!component) {
        throw new Error(`Invariant Violation: $A.mountToDom(): Invalid component element ${opaque}.`);
    }
    const ctx = getContext(component);
    if (ctx.isMounted) {
        throw new Error(`Invariant Violation: $A.mountToDom(): Component element can only be mounted once.`);
    }
    renderComponent(component);
    const tree = computeTree(component);
    // append(domNode, tree);
    domNode.appendChild(tree);
}

export function dismountComponent(component: Object) {
    throw new Error('TBI');
}
