// @flow

import {
    EmptyNode,
} from "./utils.js";

export default function mounter(newElement: Object): Node {
    if (newElement === null || newElement === EmptyNode) {
        return document.createComment('facet');
    } else if (typeof newElement === 'string') {
        return document.createTextNode(newElement);
    }
    const { Ctor, attrs, children } = newElement;
    const vnode = new Ctor(attrs, children);
    vnode.toBeMounted();
    // assert: vnode.isMounted === true
    return vnode.domNode;
}

export function mountToDom(newElement: Object, domNode: Node) {
    if (!newElement) {
        throw new Error(`Invariant Violation: $A.mountToDom(): Invalid component element ${newElement}.`);
    }
    const tree = mounter(newElement);
    // TODO: append should be in dom: append(domNode, tree);
    domNode.appendChild(tree);
}
