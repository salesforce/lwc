// this file contains some rendering ideas...

import {
    getDOMNode,
} from "aura";

import {
    getAttr,
} from "dom";

export function updateAttributeInMarkup(componentInstance, refId, attrName, attrValue) {
    let divComponentInstance = componentInstance.getRef(refId);
    if (divComponentInstance) {
        let divDomNode = getDOMNode(divComponentInstance);
        const attrConfig = getAttr(attrName); // we might want to memoize this
        attrConfig.set(divDomNode, attrName, attrValue);
    }
}
