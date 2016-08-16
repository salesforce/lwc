// this file contains some rendering ideas...

import {
    updateAttr,
} from "dom";

import {
    ComponentStateMap,
} from "./createElement.js";

// this map holds the weak references between a component and its root DOM element
// whenever a component is rendered, its domNode should be stored here
const virtualDOMWeakMap = new WeakMap();

export function getDOMNode(component) {
    return virtualDOMWeakMap.get(component);
}

export function updateAttributeInMarkup(componentInstance, refId, attrName, attrValue) {
    let divComponentInstance = componentInstance.getRef(refId);
    if (divComponentInstance) {
        let divDomNode = getDOMNode(divComponentInstance);
        updateAttr(divDomNode, attrName, attrValue);
    }
}

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
    const {dirty, dirtyPropNames} = ComponentStateMap.get(component);
    if (!propName) {
        return dirty;
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

export function updateRefComponetAttribute() {}
export function updateContentInMarkup() {}
export function unmountRefComponent() {}
export function mountComponentAfterMarker() {}

export function componentWasRehydrated(component) {
    const state = ComponentStateMap.get(component);
    const {dirtyPropNames} = state;
    state.dirty = false;
    for (let propName of dirtyPropNames) {
        dirtyPropNames[propName] = false;
    }
}
