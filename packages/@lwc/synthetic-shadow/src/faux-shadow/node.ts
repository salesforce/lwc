/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    defineProperties,
    defineProperty,
    getOwnPropertyDescriptor,
    hasOwnProperty,
    isNull,
    isTrue,
    isUndefined,
} from '@lwc/shared';

import { Node } from '../env/node';
import {
    parentNodeGetter,
    textContextSetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINED_BY,
    parentNodeGetter as nativeParentNodeGetter,
    cloneNode as nativeCloneNode,
    cloneNode,
    hasChildNodes,
    contains,
    parentElementGetter,
    lastChildGetter,
    firstChildGetter,
    textContentGetter,
    childNodesGetter,
    isConnected,
} from '../env/node';

import { getTextContent } from '../3rdparty/polymer/text-content';

import { isGlobalPatchingSkipped } from '../shared/utils';
import { createStaticNodeList } from '../shared/static-node-list';
import { getNodeNearestOwnerKey, getNodeOwnerKey, isNodeShadowed } from '../shared/node-ownership';

import { getShadowRoot, isSyntheticShadowHost } from './shadow-root';
import {
    getNodeOwner,
    isSlotElement,
    isNodeOwnedBy,
    getAllMatches,
    getFilteredChildNodes,
    isSyntheticSlotElement,
} from './traverse';

/**
 * This method checks whether or not the content of the node is computed
 * based on the light-dom slotting mechanism. This applies to synthetic slot elements
 * and elements with shadow dom attached to them. It doesn't apply to native slot elements
 * because we don't want to patch the children getters for those elements.
 */
export function hasMountedChildren(node: Node): boolean {
    return isSyntheticSlotElement(node) || isSyntheticShadowHost(node);
}

function getShadowParent(node: Node, value: ParentNode & Node): (Node & ParentNode) | null {
    const owner = getNodeOwner(node);
    if (value === owner) {
        // walking up via parent chain might end up in the shadow root element
        return getShadowRoot(owner!);
    } else if (value instanceof Element) {
        if (getNodeNearestOwnerKey(node) === getNodeNearestOwnerKey(value)) {
            // the element and its parent node belong to the same shadow root
            return value;
        } else if (!isNull(owner) && isSlotElement(value)) {
            // slotted elements must be top level childNodes of the slot element
            // where they slotted into, but its shadowed parent is always the
            // owner of the slot.
            const slotOwner = getNodeOwner(value);
            if (!isNull(slotOwner) && isNodeOwnedBy(owner, slotOwner)) {
                // it is a slotted element, and therefore its parent is always going to be the host of the slot
                return slotOwner;
            }
        }
    }
    return null;
}

function hasChildNodesPatched(this: Node): boolean {
    return getInternalChildNodes(this).length > 0;
}

function firstChildGetterPatched(this: Node): ChildNode | null {
    const childNodes = getInternalChildNodes(this);
    return childNodes[0] || null;
}

function lastChildGetterPatched(this: Node): ChildNode | null {
    const childNodes = getInternalChildNodes(this);
    return childNodes[childNodes.length - 1] || null;
}

function textContentGetterPatched(this: Node): string {
    return getTextContent(this);
}

function textContentSetterPatched(this: Node, value: string) {
    textContextSetter.call(this, value);
}

function parentNodeGetterPatched(this: Node): (Node & ParentNode) | null {
    const value = nativeParentNodeGetter.call(this);
    if (isNull(value)) {
        return value;
    }
    // TODO [#1635]: this needs optimization, maybe implementing it based on this.assignedSlot
    return getShadowParent(this, value);
}

function parentElementGetterPatched(this: Node): Element | null {
    const value = nativeParentNodeGetter.call(this);
    if (isNull(value)) {
        return null;
    }
    const parentNode = getShadowParent(this, value);
    // it could be that the parentNode is the shadowRoot, in which case
    // we need to return null.
    // TODO [#1635]: this needs optimization, maybe implementing it based on this.assignedSlot
    return parentNode instanceof Element ? parentNode : null;
}

function compareDocumentPositionPatched(this: Node, otherNode: Node) {
    if (this === otherNode) {
        return 0;
    } else if (this.getRootNode() === otherNode) {
        // "this" is in a shadow tree where the shadow root is the "otherNode".
        return 10; // Node.DOCUMENT_POSITION_CONTAINS | Node.DOCUMENT_POSITION_PRECEDING
    } else if (getNodeOwnerKey(this) !== getNodeOwnerKey(otherNode)) {
        // "this" and "otherNode" belongs to 2 different shadow tree.
        return 35; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC | Node.DOCUMENT_POSITION_PRECEDING
    }

    // Since "this" and "otherNode" are part of the same shadow tree we can safely rely to the native
    // Node.compareDocumentPosition implementation.
    return compareDocumentPosition.call(this, otherNode);
}

function containsPatched(this: Node, otherNode: Node) {
    if (otherNode == null || getNodeOwnerKey(this) !== getNodeOwnerKey(otherNode)) {
        // it is from another shadow
        return false;
    }
    return (compareDocumentPosition.call(this, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0;
}

function cloneNodePatched(this: Node, deep?: boolean): Node {
    const clone = nativeCloneNode.call(this, false);

    // Per spec, browsers only care about truthy values
    // Not strict true or false
    if (!deep) {
        return clone;
    }

    const childNodes = getInternalChildNodes(this);
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        clone.appendChild(childNodes[i].cloneNode(true));
    }

    return clone;
}

/**
 * This method only applies to elements with a shadow or slots
 */
function childNodesGetterPatched(this: Node): NodeListOf<Node> {
    if (isSyntheticShadowHost(this)) {
        const owner = getNodeOwner(this);
        const childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
        return createStaticNodeList(childNodes);
    }
    // nothing to do here since this does not have a synthetic shadow attached to it
    // TODO [#1636]: what about slot elements?
    return childNodesGetter.call(this);
}

const nativeGetRootNode = Node.prototype.getRootNode;

/**
 * Get the root by climbing up the dom tree, beyond the shadow root
 * If Node.prototype.getRootNode is supported, use it
 * else, assume we are working in non-native shadow mode and climb using parentNode
 */
const getDocumentOrRootNode: (this: Node, options?: GetRootNodeOptions) => Node = !isUndefined(
    nativeGetRootNode
)
    ? nativeGetRootNode
    : function (this: Node): Node {
          let node = this;
          let nodeParent: Node | null;
          while (!isNull((nodeParent = parentNodeGetter.call(node)))) {
              node = nodeParent!;
          }
          return node;
      };

/**
 * Get the shadow root
 * getNodeOwner() returns the host element that owns the given node
 * Note: getNodeOwner() returns null when running in native-shadow mode.
 *  Fallback to using the native getRootNode() to discover the root node.
 *  This is because, it is not possible to inspect the node and decide if it is part
 *  of a native shadow or the synthetic shadow.
 * @param {Node} node
 */
function getNearestRoot(node: Node): Node {
    const ownerNode: HTMLElement | null = getNodeOwner(node);

    if (isNull(ownerNode)) {
        // we hit a wall, either we are in native shadow mode or the node is not in lwc boundary.
        return getDocumentOrRootNode.call(node);
    }

    return getShadowRoot(ownerNode) as Node;
}

/**
 * If looking for a root node beyond shadow root by calling `node.getRootNode({composed: true})`, use the original `Node.prototype.getRootNode` method
 * to return the root of the dom tree. In IE11 and Edge, Node.prototype.getRootNode is
 * [not supported](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode#Browser_compatibility). The root node is discovered by manually
 * climbing up the dom tree.
 *
 * If looking for a shadow root of a node by calling `node.getRootNode({composed: false})` or `node.getRootNode()`,
 *
 *  1. Try to identify the host element that owns the give node.
 *     i. Identify the shadow tree that the node belongs to
 *     ii. If the node belongs to a shadow tree created by engine, return the shadowRoot of the host element that owns the shadow tree
 *  2. The host identification logic returns null in two cases:
 *     i. The node does not belong to a shadow tree created by engine
 *     ii. The engine is running in native shadow dom mode
 *     If so, use the original Node.prototype.getRootNode to fetch the root node(or manually climb up the dom tree where getRootNode() is unsupported)
 *
 * _Spec_: https://dom.spec.whatwg.org/#dom-node-getrootnode
 *
 **/
function getRootNodePatched(this: Node, options?: GetRootNodeOptions): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;
    return isTrue(composed) ? getDocumentOrRootNode.call(this, options) : getNearestRoot(this);
}

// Non-deep-traversing patches: this descriptor map includes all descriptors that
// do not give access to nodes beyond the immediate children.
defineProperties(Node.prototype, {
    firstChild: {
        get(this: Node): ChildNode | null {
            if (hasMountedChildren(this)) {
                return firstChildGetterPatched.call(this);
            }
            return firstChildGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    lastChild: {
        get(this: Node): ChildNode | null {
            if (hasMountedChildren(this)) {
                return lastChildGetterPatched.call(this);
            }
            return lastChildGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    textContent: {
        get(this: Node): string {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return textContentGetterPatched.call(this);
            }

            return textContentGetter.call(this);
        },
        set: textContentSetterPatched,
        enumerable: true,
        configurable: true,
    },
    parentNode: {
        get(this: Node): (Node & ParentNode) | null {
            if (isNodeShadowed(this)) {
                return parentNodeGetterPatched.call(this);
            }

            const parentNode = parentNodeGetter.call(this);

            // Handle the case where a top level light DOM element is slotted into a synthetic
            // shadow slot.
            if (!isNull(parentNode) && isSyntheticSlotElement(parentNode)) {
                return getNodeOwner(parentNode);
            }

            return parentNode;
        },
        enumerable: true,
        configurable: true,
    },
    parentElement: {
        get(this: Node): Element | null {
            if (isNodeShadowed(this)) {
                return parentElementGetterPatched.call(this);
            }

            const parentElement = parentElementGetter.call(this);

            // Handle the case where a top level light DOM element is slotted into a synthetic
            // shadow slot.
            if (!isNull(parentElement) && isSyntheticSlotElement(parentElement)) {
                return getNodeOwner(parentElement);
            }

            return parentElement;
        },
        enumerable: true,
        configurable: true,
    },
    childNodes: {
        get(this: Node): NodeListOf<Node> {
            if (hasMountedChildren(this)) {
                return childNodesGetterPatched.call(this);
            }

            return childNodesGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    hasChildNodes: {
        value(this: Node): boolean {
            if (hasMountedChildren(this)) {
                return hasChildNodesPatched.call(this);
            }
            return hasChildNodes.call(this);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    compareDocumentPosition: {
        value(this: Node, otherNode: Node): number {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isGlobalPatchingSkipped(this)) {
                return compareDocumentPosition.call(this, otherNode);
            }
            return compareDocumentPositionPatched.call(this, otherNode);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    contains: {
        value(this: Node, otherNode: Node): boolean {
            // 1. Node.prototype.contains() returns true if otherNode is an inclusive descendant
            //    spec: https://dom.spec.whatwg.org/#dom-node-contains
            // 2. This normalizes the behavior of this api across all browsers.
            //    In IE11, a disconnected dom element without children invoking contains() on self, returns false
            if (this === otherNode) {
                return true;
            }

            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (otherNode == null) {
                return false;
            }

            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return containsPatched.call(this, otherNode);
            }

            return contains.call(this, otherNode);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    cloneNode: {
        value(this: Node, deep?: boolean): Node {
            // Note: we deviate from native shadow here, but are not fixing
            // due to backwards compat: https://github.com/salesforce/lwc/pull/3103
            if (isNodeShadowed(this) || isSyntheticShadowHost(this)) {
                return cloneNodePatched.call(this, deep);
            }

            return cloneNode.call(this, deep);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    getRootNode: {
        value: getRootNodePatched,
        enumerable: true,
        configurable: true,
        writable: true,
    },
    isConnected: {
        enumerable: true,
        configurable: true,
        get(this: Node) {
            return isConnected.call(this);
        },
    },
});

export const getInternalChildNodes: (node: Node) => NodeListOf<ChildNode> = function (node) {
    return node.childNodes;
};

// IE11 extra patches for wrong prototypes
if (hasOwnProperty.call(HTMLElement.prototype, 'contains')) {
    defineProperty(
        HTMLElement.prototype,
        'contains',
        getOwnPropertyDescriptor(Node.prototype, 'contains')!
    );
}

if (hasOwnProperty.call(HTMLElement.prototype, 'parentElement')) {
    defineProperty(
        HTMLElement.prototype,
        'parentElement',
        getOwnPropertyDescriptor(Node.prototype, 'parentElement')!
    );
}
