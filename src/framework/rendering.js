/* @flow */

import {
    updateAttr,
} from "aura-dom";

import {
    getContext,
    establishContext,
    currentContext,
} from "./context.js";

import {
    getRef,
    createElement,
    opaqueToComponentMap,
} from "./createElement.js";

import {
    isHTMLComponent,
} from "./html-component-factory.js";

function isComputedPropertyDirty(deps: Array<string>, dirtyPropNames: Object): boolean {
    // the propName is a computed property, and should be computed accordingly
    for (let depPropName in deps) {
        if (dirtyPropNames[depPropName]) {
            return true;
        }
    }
    return false;
}

const rehydratedSymbol = Symbol('Signal when the component is rehydrated during rendering.');

export function isDirty(component: Object, propName: string): boolean {
    const {isDirty, dirtyPropNames} = getContext(component);
    if (!propName) {
        return isDirty;
    }
    if (!dirtyPropNames.hasOwnProperty(propName)) {
        let descriptor = Object.getOwnPropertyDescriptor(component, propName);
        if (descriptor && descriptor.get) {
            let deps = descriptor.get.dependencies;
            if (deps) {
                if (isComputedPropertyDirty(deps, dirtyPropNames)) {
                    return true;
                }
             } else {
                dirtyPropNames[propName] = false;
            }
        }
    }
    return dirtyPropNames[propName] || false;
}

function attemptToUpdate(component: Object) {
    const {isMounted, isDirty} = getContext(component);
    if (isMounted && isDirty) {
        renderComponent(component);
    }
}

export function markComponentAsDirty(component: Object, propName: string) {
    const ctx = getContext(component);
    if (ctx.isRendering) {
        throw new Error(`Invariant Violation: ${ctx.name}.render() method has side effects on the state of the component.`);
    }
    ctx.isDirty = true;
    ctx.dirtyPropNames[propName] = true;
    // TODO: this promise might need to be controlled so we only render once in the next tick
    // maybe storing the promise into the component's context
    Promise.resolve(component).then(attemptToUpdate);
}

export function updateAttributeInMarkup(component: Object, refId: string, attrName: string, attrValue: any) {
    let refInstance = getRef(component, refId);
    // TODO: this might not work at all, and we should go thru the actually setters
    if (refInstance && refInstance.domNode) {
        updateAttr(refInstance.domNode, attrName, attrValue);
    }
}

export function updateRefComponentAttribute(component: Object, refId: string, attrName: string, attrValue: any) {
    let refInstance = getRef(component, refId);
    if (refInstance) {
        refInstance[attrName] = attrValue;
    }
}
export function updateContentInMarkup() {}
export function unmountRefComponent() {}
export function mountComponentAfterMarker() {}

export function componentWasRehydrated(component: Object): any {
    const ctx = getContext(component);
    const {dirtyPropNames} = ctx;
    ctx.isDirty = false;
    for (let propName in dirtyPropNames) {
        dirtyPropNames[propName] = false;
    }
    return rehydratedSymbol;
}

function invokeComponentRender(component: Object): any {
    if (!component.render) {
        return null;
    }
    const outerContext = currentContext;
    const ctx = getContext(component);
    establishContext(ctx);
    const element = component.render({
        isDirty,
        createElement,
        updateAttributeInMarkup,
        updateRefComponentAttribute,
        updateContentInMarkup,
        unmountRefComponent,
        mountComponentAfterMarker,
        componentWasRehydrated,
    });
    establishContext(outerContext);
    return element;
}

function invokeComponentAttach(component: Object) {
    if (component.attach) {
        const outerContext = currentContext;
        const ctx = getContext(component);
        establishContext(ctx);
        component.attach(ctx.tree);
        establishContext(outerContext);
    }
}

function invokeComponentDetach(component: Object) {
    if (component.detach) {
        const outerContext = currentContext;
        const ctx = getContext(component);
        establishContext(ctx);
        component.detach(ctx.tree);
        establishContext(outerContext);
    }
}

export function renderComponent(component: Object) {
    const ctx = getContext(component);
    const {childComponent} = ctx;
    ctx.isRendering = true;
    let opaque = invokeComponentRender(component);
    ctx.isRendering = false;
    ctx.isRendered = true;
    let newChildComponent = null;
    if (opaque === rehydratedSymbol) {
        newChildComponent = childComponent;
    } else if (opaque === null) {
        newChildComponent = null;
    } else if (opaqueToComponentMap.has(opaque)) {
        newChildComponent = opaqueToComponentMap.get(opaque);
        renderComponent(newChildComponent);
    } else {
        throw new Error(`Invariant Violation: ${ctx.name}.render(): A valid Component element (or null) must be returned. You have returned ${opaque} instead.`);
    }
    if (childComponent !== newChildComponent) {
        digestNewChildComponent(component, newChildComponent);
    }
}

// TODO: this may not be needed if we can guarantee that all the rehyadration will take care of it.
function digestNewChildComponent(component: Object, newChildComponent: Object) {
    const ctx = getContext(component);
    const {childComponent, tree} = ctx;
    ctx.childComponent = newChildComponent;
    if (ctx.isMounted) {
        // generate new tree
        const newTree = getRootNodeFromComponent(component);
        // TODO: replace should be in dom
        tree.parentNode.replaceChild(tree, newTree);
    }
    if (childComponent !== null) {
        dismountComponent(childComponent);
    }
}

export function getRootNodeFromComponent(component: Object): Node {
    const ctx = getContext(component);
    const {childComponent, isRendered} = ctx;
    if (!isRendered) {
        throw new Error(`Assert: Component element must be rendered.`);
    }
    let tree = null;
    if (isHTMLComponent(component)) {
        tree = component.domNode;
    } else if (childComponent) {
        tree = getRootNodeFromComponent(childComponent);
    } else {
        // generate a marker
        tree = document.createComment('facet');
    }
    ctx.tree = tree;
    invokeComponentAttach(component);
    return tree;
}

function dismountComponent(component: Object) {
    const ctx = getContext(component);
    const {childComponent, isMounted} = ctx;
    if (!isMounted) {
        throw new Error(`Assert: Component element must be mounted.`);
    }
    // TODO: we might want to inverse this to dismounting childComponent before component
    invokeComponentDetach(component);
    if (childComponent) {
        dismountComponent(childComponent);
    }
    ctx.isMounted = false;
}
