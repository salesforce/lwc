/* @flow */

import {
    updateAttr,
} from "dom";

import {
    getContext,
    establishContext,
    currentContext,
} from "./context.js";

import {
    getRef,
    isValidElement,
} from "./createElement.js";

function isComputedPropertyDirty(deps: Array<string>, dirtyPropNames: Object): boolean {
    // the propName is a computed property, and should be computed accordingly
    for (let depPropName in deps) {
        if (dirtyPropNames[depPropName]) {
            return true;
        }
    }
    return false;
}

export const rehydratedSymbol = Symbol('Signal when the component is rehydrated during rendering.');

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

export function markComponentAsDirty(component: Object, propName: string) {
    const ctx = getContext(component);
    ctx.isDirty = true;
    ctx.dirtyPropNames[propName] = true;
}

export function updateAttributeInMarkup(componentInstance: Object, refId: string, attrName: string, attrValue: any) {
    let refInstance = getRef(componentInstance, refId);
    // TODO: this might not work at all, and we should go thru the actually setters
    if (refInstance && refInstance.domNode) {
        updateAttr(refInstance.domNode, attrName, attrValue);
    }
}

export function updateRefComponentAttribute(componentInstance: Object, refId: string, attrName: string, attrValue: any) {
    let refInstance = getRef(componentInstance, refId);
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
    for (let propName of dirtyPropNames) {
        dirtyPropNames[propName] = false;
    }
    return rehydratedSymbol;
}

export function renderComponent(component: Object) {
    const outerContext = currentContext;
    const ctx = getContext(component);
    establishContext(ctx);
    let elementOrNullOrSymbol = component.render({
        isDirty,
        updateAttributeInMarkup,
        updateRefComponentAttribute,
        updateContentInMarkup,
        unmountRefComponent,
        mountComponentAfterMarker,
        componentWasRehydrated,
    });
    if (elementOrNullOrSymbol === rehydratedSymbol) {
        // do nothing
    }
    if (!isValidElement(elementOrNullOrSymbol)) {
        throw new Error(`Invariant Violation: ${ctx.name}.render(): A valid Component element (or null) must be returned. You have returned ${element} instead.`);
    }
    throw new Error('TBI');
    establishContext(outerContext);
}
