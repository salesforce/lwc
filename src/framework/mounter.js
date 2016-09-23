// @flow

import {
    flattenElements,
} from "./utils.js";
import assert from "./assert.js";
import { getElementDomNode } from "./vnode.js";

export function mount(newElement: Object) {
    assert.element(newElement);
    const { Ctor, attrs, children } = newElement;
    const vnode = new Ctor(attrs, flattenElements(children));
    console.log(`Mounting ${vnode}`);
    vnode.toBeMounted();
    assert.isTrue(vnode.isMounted, `Failed to mount element ${vnode}.`);
    newElement.vnode = vnode;
}

export function mountToDom(newElement: Object, domNode: Node) {
    assert.element(newElement);
    mount(newElement);
    let newDomNode = getElementDomNode(newElement);
    // TODO: append should be in dom: append(domNode, newDomNode);
    domNode.appendChild(newDomNode);
}
