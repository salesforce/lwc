/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, hasOwnProperty } from '../shared/language';

const {
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,

    DOCUMENT_FRAGMENT_NODE,
} = Node;

const {
    appendChild,
    cloneNode,
    compareDocumentPosition,
    hasChildNodes,
    insertBefore,
    removeChild,
    replaceChild,
} = Node.prototype;

const parentNodeGetter: (this: Node) => Element | null = getOwnPropertyDescriptor(
    Node.prototype,
    'parentNode'
)!.get!;

const ownerDocumentGetter: (this: Node) => Document | null = getOwnPropertyDescriptor(
    Node.prototype,
    'ownerDocument'
)!.get!;

const parentElementGetter: (this: Node) => Element | null = hasOwnProperty.call(
    Node.prototype,
    'parentElement'
)
    ? getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!; // IE11

const textContextSetter: (this: Node, s: string) => void = getOwnPropertyDescriptor(
    Node.prototype,
    'textContent'
)!.set!;

const childNodesGetter: (this: Node) => NodeListOf<Node & Element> = hasOwnProperty.call(
    Node.prototype,
    'childNodes'
)
    ? getOwnPropertyDescriptor(Node.prototype, 'childNodes')!.get!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes')!.get!; // IE11

const nodeValueDescriptor = getOwnPropertyDescriptor(Node.prototype, 'nodeValue')!;

const nodeValueSetter: (this: Node, value: string) => void = nodeValueDescriptor.set!;

const nodeValueGetter: (this: Node) => string = nodeValueDescriptor.get!;

const isConnected = hasOwnProperty.call(Node.prototype, 'isConnected')
    ? getOwnPropertyDescriptor(Node.prototype, 'isConnected')!.get!
    : function(this: Node): boolean {
          const doc = ownerDocumentGetter.call(this);
          // IE11
          return (
              // if doc is null, it means `this` is actually a document instance which
              // is always connected
              doc === null ||
              (compareDocumentPosition.call(doc, this) & DOCUMENT_POSITION_CONTAINED_BY) !== 0
          );
      };

export {
    // Node.prototype
    appendChild,
    childNodesGetter,
    cloneNode,
    compareDocumentPosition,
    hasChildNodes,
    insertBefore,
    isConnected,
    nodeValueGetter,
    nodeValueSetter,
    parentElementGetter,
    parentNodeGetter,
    removeChild,
    replaceChild,
    textContextSetter,
    ownerDocumentGetter,
    // Node
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
    // Node Types
    DOCUMENT_FRAGMENT_NODE,
};
