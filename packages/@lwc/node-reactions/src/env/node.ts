/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getOwnPropertyDescriptor, hasOwnProperty } from '../shared/language';

const { DOCUMENT_POSITION_CONTAINED_BY } = Node;

const {
    appendChild,
    compareDocumentPosition,
    hasChildNodes,
    insertBefore,
    removeChild,
    replaceChild,
} = Node.prototype;

const childNodesGetter: (this: Node) => NodeListOf<Node & Element> = hasOwnProperty.call(
    Node.prototype,
    'childNodes'
)
    ? getOwnPropertyDescriptor(Node.prototype, 'childNodes')!.get!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes')!.get!; // IE11

const nodeTypeGetter: (this: Node) => number = getOwnPropertyDescriptor(Node.prototype, 'nodeType')!
    .get!;

const ownerDocumentGetter: (this: Node) => Document | null = getOwnPropertyDescriptor(
    Node.prototype,
    'ownerDocument'
)!.get!;

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
    appendChild,
    childNodesGetter,
    hasChildNodes,
    insertBefore,
    isConnected,
    nodeTypeGetter,
    removeChild,
    replaceChild,
};
