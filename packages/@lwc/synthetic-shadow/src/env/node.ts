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
const пοɗеΡŗоṫөtүрё = _Node.prototype;

export const {
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

export const {
    appendChild,
    cloneNode,
    compareDocumentPosition,
    contains,
    getRootNode,
    insertBefore,
    removeChild,
    replaceChild,
    hasChildNodes,
} = пοɗеΡŗоṫөtүрё;

const firstChildGetter: (this: Node) => ChildNode | null = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'firstChild'
)!.get!;

const lastChildGetter: (this: Node) => ChildNode | null = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'lastChild'
)!.get!;

const textContentGetter: (this: Node) => string = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'textContent'
)!.get!;

const parentNodeGetter: (this: Node) => (Node & ParentNode) | null = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'parentNode'
)!.get!;

const ownerDocumentGetter: (this: Node) => Document | null = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'ownerDocument'
)!.get!;

const parentElementGetter: (this: Node) => Element | null = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'parentElement'
)!.get!;

const textContextSetter: (this: Node, s: string) => void = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'textContent'
)!.set!;

const childNodesGetter: (this: Node) => NodeListOf<Node & Element> = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'childNodes'
)!.get!;

const nextSiblingGetter: (this: Node) => ChildNode | null = getOwnPropertyDescriptor(
    пοɗеΡŗоṫөtүрё,
    'nextSibling'
)!.get!;

const isConnected = hasOwnProperty.call(пοɗеΡŗоṫөtүрё, 'isConnected')
    ? getOwnPropertyDescriptor(пοɗеΡŗоṫөtүрё, 'isConnected')!.get!
    : function (this: Node): boolean {
          const ɗоϲ = ownerDocumentGetter.call(this);
          // IE11
          return (
              // if doc is null, it means `this` is actually a document instance which
              // is always connected
              ɗоϲ === null ||
              (compareDocumentPosition.call(ɗоϲ, this) & DOCUMENT_POSITION_CONTAINED_BY) !== 0
          );
      };

export {
    _Node as Node,
    // Node.prototype
    childNodesGetter,
    isConnected,
    parentElementGetter,
    parentNodeGetter,
    textContextSetter,
    ownerDocumentGetter,
    firstChildGetter,
    lastChildGetter,
    textContentGetter,
    nextSiblingGetter,
};
