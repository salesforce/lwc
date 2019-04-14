/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * This utility provides a synchronous mechanism to react to certain don operations:
 * - a particular element was connected or disconnected (useful for polyfilling custom elements)
 * - a particular element has received new children (useful for patching and slotting)
 * - a particular element has loose some children (useful for patching and slotting)
 */

// TODO: this file should be moved into its own pkg called node-reactions.

const NodeReactionsInstalledSlot = '$node:reaction$';

function callNodeSlot(node: Node, slot: PropertyKey): Node {
    const fn = node[slot];
    // Note: reaction flag is only valid if nodes are connected according
    //       to the spec, but for performance reasons, we will allow these
    //       reactions to also work on fragments and disconnected elements.
    if (fn !== undefined) {
        fn();
    }
    return node; // for convenience
}

if (Node.prototype.insertBefore[NodeReactionsInstalledSlot] !== 'installed') {
    const { assign, defineProperty, hasOwnProperty, getOwnPropertyDescriptor } = Object;

    const { appendChild, insertBefore, removeChild, replaceChild } = Node.prototype;

    const innerHTMLProto = hasOwnProperty.call(Element.prototype, 'innerHTML')
        ? Element.prototype
        : HTMLElement.prototype; // IE11

    const nodeValueDescriptor = getOwnPropertyDescriptor(Node.prototype, 'nodeValue')!;
    const textContentDescriptor = getOwnPropertyDescriptor(Node.prototype, 'textContent')!;
    const innerHTMLDescriptor = getOwnPropertyDescriptor(innerHTMLProto, 'innerHTML')!;

    const nodeValueSetter: (this: Node, value: string) => void = nodeValueDescriptor.set!;
    const textContentSetter: (this: Node, s: string) => void = textContentDescriptor!.set!;
    const innerHTMLSetter: (this: Element, s: string) => void = innerHTMLDescriptor!.set!;

    const ConnectedSlot = '$node:connected$';
    const DisconnectedSlot = '$node:disconnected$';
    const ChildNodesUpdatedSlot = '$node:updated$';

    innerHTMLDescriptor.set = function set(this: Element, newValue: any) {
        innerHTMLSetter.call(this, newValue);
        callNodeSlot(this, ChildNodesUpdatedSlot);
    };
    textContentDescriptor.set = function set(this: Element, newValue: any) {
        textContentSetter.call(this, newValue);
        callNodeSlot(this, ChildNodesUpdatedSlot);
    };
    nodeValueDescriptor.set = function set(this: Element, newValue: any) {
        nodeValueSetter.call(this, newValue);
        callNodeSlot(this, ChildNodesUpdatedSlot);
    };

    // monkey patching Node methods to be able to detect the insertions and removal of elements
    assign(Node.prototype, {
        appendChild(this: Node, newChild: Node): Node {
            const appendedNode = appendChild.call(this, newChild);
            callNodeSlot(this, ChildNodesUpdatedSlot);
            return callNodeSlot(appendedNode, ConnectedSlot);
        },
        insertBefore(this: Node, newChild: Node, referenceNode: Node): Node {
            const insertedNode = insertBefore.call(this, newChild, referenceNode);
            callNodeSlot(this, ChildNodesUpdatedSlot);
            return callNodeSlot(insertedNode, ConnectedSlot);
        },
        removeChild(this: Node, oldChild: Node): Node {
            const removedNode = removeChild.call(this, oldChild);
            callNodeSlot(this, ChildNodesUpdatedSlot);
            return callNodeSlot(removedNode, DisconnectedSlot);
        },
        replaceChild(this: Node, newChild: Node, oldChild: Node): Node {
            const replacedNode = replaceChild.call(this, newChild, oldChild);
            callNodeSlot(this, ChildNodesUpdatedSlot);
            callNodeSlot(replacedNode, DisconnectedSlot);
            callNodeSlot(newChild, ConnectedSlot);
            return replacedNode;
        },
    });
    defineProperty(innerHTMLProto, 'innerHTML', innerHTMLDescriptor);
    defineProperty(Node.prototype, 'textContent', textContentDescriptor);
    defineProperty(Node.prototype, 'nodeValue', nodeValueDescriptor);
    /**
     * TODO:
     *  - Element.outerHTML
     *  - Node.remove()
     *  ...
     */
    defineProperty(Node.prototype.insertBefore, NodeReactionsInstalledSlot, { value: 'installed' });
}
