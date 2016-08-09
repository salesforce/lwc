// this file contains some rendering ideas...

import {
    getAttr,
} from "dom";

// this map hold the weak references between a component and its root DOM element
// whenever a component is rendered, its domNode should be stored here
const virtualDOMWeakMap = new WeakMap();

export function getDOMNode(component) {
    return virtualDOMWeakMap.get(component);
}

export function updateAttributeInMarkup(componentInstance, refId, attrName, attrValue) {
    let divComponentInstance = componentInstance.getRef(refId);
    if (divComponentInstance) {
        let divDomNode = getDOMNode(divComponentInstance);
        const attrConfig = getAttr(attrName); // we might want to memoize this
        attrConfig.set(divDomNode, attrName, attrValue);
    }
}

export function isDirty() {}
export function updateRefComponetAttribute() {}
export function updateContentInMarkup() {}
export function unmountRefComponent() {}
export function mountComponentAfterMarker() {}
export function componentWasRehydrated() {}
