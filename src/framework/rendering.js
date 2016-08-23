// @flow

const rehydratedSymbol = Symbol('Signal when the component is rehydrated during rendering.');

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
    mountNewChildComponent,
} from "./mounter.js";

function isComputedPropertyDirty(deps: Array<string>, dirtyPropNames: Object): boolean {
    for (let depPropName in deps) {
        if (dirtyPropNames[depPropName]) {
            return true;
        }
    }
    return false;
}

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

function invokeComponentRenderMethod(component: Object): any {
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

export function renderComponent(component: Object) {
    const ctx = getContext(component);
    const {childComponent} = ctx;
    ctx.isRendering = true;
    let opaque = invokeComponentRenderMethod(component);
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
        mountNewChildComponent(component, newChildComponent);
    }
}
