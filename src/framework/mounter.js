// @flow

import {
    flattenElements,
    assertElement,
    assert,
} from "./utils.js";

import {
    getElementDomNode
} from "./vnode.js";

export default function mounter(newElement: Object) {
    assertElement(newElement);
    const { Ctor, attrs, children } = newElement;
    const vnode = new Ctor(attrs, flattenElements(children));
    vnode.toBeMounted();
    assert(vnode.isMounted, `Failed to mount element ${newElement}.`);
    newElement.vnode = vnode;
}

export function mountToDom(newElement: Object, domNode: Node) {
    assertElement(newElement);
    mounter(newElement);
    let newDomNode = getElementDomNode(newElement);
    // TODO: append should be in dom: append(domNode, newDomNode);
    domNode.appendChild(newDomNode);
}
