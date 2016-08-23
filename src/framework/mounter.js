// @flow

import {
    currentContext,
    getContext,
    establishContext,
} from "./context.js";

import {
    dismountComponent,
} from "./dismounter.js"

import {
    renderComponent,
} from "./rendering.js";

import {
    opaqueToComponentMap,
} from "./createElement.js";

import {
    isHTMLComponent,
} from "./html-component-factory.js";

function invokeComponentAttachMethod(component: Object) {
    if (component.attach) {
        const outerContext = currentContext;
        const ctx = getContext(component);
        establishContext(ctx);
        component.attach(ctx.tree);
        establishContext(outerContext);
    }
}
export function getComponentRootNode(component: Object): Node {
    const ctx = getContext(component);
    const {childComponent, isRendered} = ctx;
    if (!isRendered) {
        throw new Error(`Assert: Component element must be rendered.`);
    }
    let tree = null;
    if (isHTMLComponent(component)) {
        tree = component.domNode;
    } else if (childComponent) {
        tree = getComponentRootNode(childComponent);
    } else {
        // generate a marker
        tree = document.createComment('facet');
    }
    ctx.tree = tree;
    invokeComponentAttachMethod(component);
    return tree;
}

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
    const tree = getComponentRootNode(component);
    // TODO: append should be in dom: append(domNode, tree);
    domNode.appendChild(tree);
}

export function mountNewChildComponent(component: Object, newChildComponent: Object) {
    const ctx = getContext(component);
    const {childComponent, tree} = ctx;
    ctx.childComponent = newChildComponent;
    if (ctx.isMounted) {
        // generate new tree
        const newTree = getComponentRootNode(component);
        // TODO: replace should be in dom: replace(tree, newTree);
        tree.parentNode.replaceChild(tree, newTree);
    }
    if (childComponent !== null) {
        dismountComponent(childComponent);
    }
}
