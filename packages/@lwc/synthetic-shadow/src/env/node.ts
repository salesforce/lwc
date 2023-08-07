/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, hasOwnProperty } from '@lwc/shared';

// TODO [#2472]: Remove this workaround when appropriate.
// eslint-disable-next-line @lwc/lwc-internal/no-global-node
const _Node = Node;
const nodePrototype = _Node.prototype;

const {
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
    ELEMENT_NODE,
    TEXT_NODE,
    CDATA_SECTION_NODE,
    PROCESSING_INSTRUCTION_NODE,
    COMMENT_NODE,
    DOCUMENT_FRAGMENT_NODE,
} = _Node;

const {
    appendChild,
    cloneNode,
    compareDocumentPosition,
    insertBefore,
    removeChild,
    replaceChild,
    hasChildNodes,
} = nodePrototype;

const { contains } = HTMLElement.prototype;

const firstChildGetter: (this: Node) => ChildNode | null = getOwnPropertyDescriptor(
    nodePrototype,
    'firstChild'
)!.get!;

const lastChildGetter: (this: Node) => ChildNode | null = getOwnPropertyDescriptor(
    nodePrototype,
    'lastChild'
)!.get!;

const textContentGetter: (this: Node) => string = getOwnPropertyDescriptor(
    nodePrototype,
    'textContent'
)!.get!;

const parentNodeGetter: (this: Node) => (Node & ParentNode) | null = getOwnPropertyDescriptor(
    nodePrototype,
    'parentNode'
)!.get!;

const ownerDocumentGetter: (this: Node) => Document | null = getOwnPropertyDescriptor(
    nodePrototype,
    'ownerDocument'
)!.get!;

const parentElementGetter: (this: Node) => Element | null = getOwnPropertyDescriptor(
    nodePrototype,
    'parentElement'
)!.get!;

const textContextSetter: (this: Node, s: string) => void = getOwnPropertyDescriptor(
    nodePrototype,
    'textContent'
)!.set!;

const childNodesGetter: (this: Node) => NodeListOf<Node & Element> = getOwnPropertyDescriptor(
    nodePrototype,
    'childNodes'
)!.get!;

const isConnected = hasOwnProperty.call(nodePrototype, 'isConnected')
    ? getOwnPropertyDescriptor(nodePrototype, 'isConnected')!.get!
    : function (this: Node): boolean {
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
    _Node as Node,
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
    ELEMENT_NODE,
    TEXT_NODE,
    CDATA_SECTION_NODE,
    PROCESSING_INSTRUCTION_NODE,
    COMMENT_NODE,
    DOCUMENT_FRAGMENT_NODE,
};
