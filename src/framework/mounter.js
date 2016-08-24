// @flow

import {
    currentContext,
    getContext,
    establishContext,
} from "./context.js";

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
    const { isRendered } = ctx;
    if (!isRendered) {
        renderComponent(component);
    }
    // if the component is rendered, it is very likely that it has a child component
    const { childComponent } = ctx;
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
    ctx.isMounted = true;
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
    const tree = getComponentRootNode(component);
    // TODO: append should be in dom: append(domNode, tree);
    domNode.appendChild(tree);
}

export function mountChildComponent(component: Object, childComponent: Object) {
    const ctx = getContext(component);
    const { tree } = ctx;
    ctx.childComponent = childComponent;
    if (!ctx.isMounted) {
        throw new Error(`Invariant Violation: A component can only be mounted inside a mounted component.`);
    }
    // assert: tree is a domNode and has a parentNode
    const newTree = getComponentRootNode(childComponent);
    // TODO: replace should be in dom: replace(newTree, tree);
    tree.parentNode.replaceChild(newTree, tree);
}
