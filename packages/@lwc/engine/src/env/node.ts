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
    insertBefore,
    removeChild,
    appendChild,
    hasChildNodes,
    replaceChild,
    compareDocumentPosition,
    cloneNode,
} = Node.prototype;

const parentNodeGetter: (this: Node) => Element | null = getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!;

const parentElementGetter: (this: Node) => Element | null = hasOwnProperty.call(Node.prototype, 'parentElement')
    ? getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!; // IE11

const textContextSetter: (this: Node, s: string) => void = getOwnPropertyDescriptor(Node.prototype, 'textContent')!
    .set!;

const childNodesGetter: (this: Node) => NodeList = hasOwnProperty.call(Node.prototype, 'childNodes')
    ? getOwnPropertyDescriptor(Node.prototype, 'childNodes')!.get!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes')!.get!; // IE11

const nodeValueDescriptor = getOwnPropertyDescriptor(Node.prototype, 'nodeValue')!;

const nodeValueSetter: (this: Node, value: string) => void = nodeValueDescriptor.set!;

const nodeValueGetter: (this: Node) => string = nodeValueDescriptor.get!;

const isConnected = hasOwnProperty.call(Node.prototype, 'isConnected')
    ? getOwnPropertyDescriptor(Node.prototype, 'isConnected')!.get!
    : function(this: Node): boolean {
          // IE11
          return (compareDocumentPosition.call(document, this) & DOCUMENT_POSITION_CONTAINED_BY) !== 0;
      };

export {
    // Node.prototype
    compareDocumentPosition,
    hasChildNodes,
    insertBefore,
    removeChild,
    replaceChild,
    appendChild,
    parentNodeGetter,
    parentElementGetter,
    childNodesGetter,
    textContextSetter,
    nodeValueGetter,
    nodeValueSetter,
    cloneNode,
    isConnected,
    // Node
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
    // Node Types
    DOCUMENT_FRAGMENT_NODE,
};
