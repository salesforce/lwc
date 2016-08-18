import {
    updateAttr,
} from "dom";

import {
    currentContext,
} from "./context.js";

import {
    getRef,
    isValidElement,
    ComponentStateMap,
} from "./createElement.js";

function isComputedPropertyDirty(deps, dirtyPropNames) {
    // the propName is a computed property, and should be computed accordingly
    for (let depPropName in deps) {
        if (dirtyPropNames[depPropName]) {
            return true;
        }
    }
    return false;
}

export function isDirty(component, propName) {
    const {isDirty, dirtyPropNames} = ComponentStateMap.get(component);
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

export function updateAttributeInMarkup(componentInstance, refId, attrName, attrValue) {
    let refInstance = getRef(componentInstance, refId);
    // TODO: this might not work at all, and we should go thru the actually setters
    if (refInstance && refInstance.domNode) {
        updateAttr(refInstance.domNode, attrName, attrValue);
    }
}

export function updateRefComponentAttribute(componentInstance, refId, attrName, attrValue) {
    let refInstance = getRef(componentInstance, refId);
    if (refInstance) {
        refInstance[attrName] = attrValue;
    }
}
export function updateContentInMarkup() {}
export function unmountRefComponent() {}
export function mountComponentAfterMarker() {}

export function componentWasRehydrated(component) {
    const state = ComponentStateMap.get(component);
    const {dirtyPropNames} = state;
    state.isDirty = false;
    for (let propName of dirtyPropNames) {
        dirtyPropNames[propName] = false;
    }
}

export function renderComponent(component) {
    const ctx = currentContext;
    let element = component.render({
        isDirty,
        updateAttributeInMarkup,
        updateRefComponentAttribute,
        updateContentInMarkup,
        unmountRefComponent,
        mountComponentAfterMarker,
        componentWasRehydrated,
    });
    if (!isValidElement(element)) {
        throw new Error(`Invariant Violation: ${ctx.name}.render(): A valid Aura element (or null) must be returned. You have returned ${element} instead.`);
    }
    ctx.tree = element;
}
