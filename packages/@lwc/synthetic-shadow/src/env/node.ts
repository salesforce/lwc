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
    insertBefore,
    removeChild,
    replaceChild,
    hasChildNodes,
    contains,
} = Node.prototype;

const firstChildGetter: (this: Node) => ChildNode | null = getOwnPropertyDescriptor(
    Node.prototype,
    'firstChild'
)!.get!;

const lastChildGetter: (this: Node) => ChildNode | null = getOwnPropertyDescriptor(
    Node.prototype,
    'lastChild'
)!.get!;

const textContentGetter: (this: Node) => string = getOwnPropertyDescriptor(
    Node.prototype,
    'textContent'
)!.get!;

const parentNodeGetter: (this: Node) => (Node & ParentNode) | null = getOwnPropertyDescriptor(
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
    insertBefore,
    isConnected,
    parentElementGetter,
    parentNodeGetter,
    removeChild,
    replaceChild,
    textContextSetter,
    ownerDocumentGetter,
    hasChildNodes,
    contains,
    firstChildGetter,
    lastChildGetter,
    textContentGetter,
    // Node
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
    // Node Types
    DOCUMENT_FRAGMENT_NODE,
};
