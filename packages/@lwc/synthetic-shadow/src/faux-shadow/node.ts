/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    isNull,
    isFalse,
    defineProperty,
    defineProperties,
    ArrayUnshift,
    isTrue,
    hasOwnProperty,
    getOwnPropertyDescriptor,
} from '../shared/language';
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
} from '../env/node';
import {
    getNodeOwner,
    isSlotElement,
    isNodeOwnedBy,
    getAllMatches,
    getFilteredChildNodes,
} from './traverse';
import { getTextContent } from '../3rdparty/polymer/text-content';
import { getShadowRoot, isHostElement, getIE11FakeShadowRootPlaceholder } from './shadow-root';
import { createStaticNodeList } from '../shared/static-node-list';
import { isGlobalPatchingSkipped } from '../shared/utils';

// DO NOT CHANGE this:
// these two values need to be in sync with engine
const OwnerKey = '$$OwnerKey$$';
const OwnKey = '$$OwnKey$$';

export const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function getNodeOwnerKey(node: Node): number | undefined {
    return node[OwnerKey];
}

export function setNodeOwnerKey(node: Node, value: number) {
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the owner key
        defineProperty(node, OwnerKey, {
            value,
            configurable: true,
        });
    } else {
        // in prod, for better perf, we just let it roll
        node[OwnerKey] = value;
    }
}

export function setNodeKey(node: Node, value: number) {
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we are more restrictive about what you can do with the own key
        defineProperty(node, OwnKey, {
            value, // can't be mutated
        });
    } else {
        // in prod, for better perf, we just let it roll
        node[OwnKey] = value;
    }
}

export function getNodeNearestOwnerKey(node: Node): number | undefined {
    let ownerNode: Node | null = node;
    let ownerKey: number | undefined;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(ownerNode)) {
        ownerKey = ownerNode[OwnerKey];
        if (!isUndefined(ownerKey)) {
            return ownerKey;
        }
        ownerNode = parentNodeGetter.call(ownerNode);
    }
}

export function getNodeKey(node: Node): number | undefined {
    return node[OwnKey];
}

export function isNodeShadowed(node: Node): boolean {
    return !isUndefined(getNodeNearestOwnerKey(node));
}

/**
 * This method checks whether or not the content of the node is computed
 * based on the light-dom slotting mechanism. This applies to slot elements
 * and elements with shadow dom attached to them.
 */
export function hasMountedChildren(node: Node): boolean {
    return isSlotElement(node) || isHostElement(node);
}

function getShadowParent(node: Node, value: ParentNode & Node): (Node & ParentNode) | null {
    const owner = getNodeOwner(node);
    if (value === owner) {
        // walking up via parent chain might end up in the shadow root element
        return getShadowRoot(owner);
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
    // TODO: this needs optimization, maybe implementing it based on this.assignedSlot
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
    // TODO: this needs optimization, maybe implementing it based on this.assignedSlot
    return parentNode instanceof Element ? parentNode : null;
}

function compareDocumentPositionPatched(this: Node, otherNode: Node) {
    if (this.getRootNode() === otherNode) {
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

function cloneNodePatched(this: Node, deep: boolean): Node {
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
function childNodesGetterPatched(this: Node): NodeListOf<Node & Element> {
    if (this instanceof Element && isHostElement(this)) {
        const owner = getNodeOwner(this);
        const childNodes = isNull(owner) ? [] : getAllMatches(owner, getFilteredChildNodes(this));
        if (
            process.env.NODE_ENV !== 'production' &&
            isFalse(hasNativeSymbolsSupport) &&
            isExternalChildNodeAccessorFlagOn()
        ) {
            // inserting a comment node as the first childNode to trick the IE11
            // DevTool to show the content of the shadowRoot, this should only happen
            // in dev-mode and in IE11 (which we detect by looking at the symbol).
            // Plus it should only be in place if we know it is an external invoker.
            ArrayUnshift.call(childNodes, getIE11FakeShadowRootPlaceholder(this));
        }
        return createStaticNodeList(childNodes);
    }
    // nothing to do here since this does not have a synthetic shadow attached to it
    // TODO: what about slot elements?
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
    : function(this: Node): Node {
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
// do not five access to nodes beyond the immediate children.
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
            if (isNodeShadowed(this) || isHostElement(this)) {
                return textContentGetterPatched.call(this);
            }
            // TODO: issue #1222 - remove global bypass
            if (isGlobalPatchingSkipped(this)) {
                return textContentGetter.call(this);
            }
            return textContentGetterPatched.call(this);
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
            return parentNodeGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    parentElement: {
        get(this: Node): Element | null {
            if (isNodeShadowed(this)) {
                return parentElementGetterPatched.call(this);
            }
            return parentElementGetter.call(this);
        },
        enumerable: true,
        configurable: true,
    },
    childNodes: {
        get(this: Node): NodeListOf<Node & Element> {
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
            // TODO: issue #1222 - remove global bypass
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
            // TODO: issue #1222 - remove global bypass
            if (isGlobalPatchingSkipped(this)) {
                contains.call(otherNode, otherNode);
            }
            return containsPatched.call(this, otherNode);
        },
        enumerable: true,
        writable: true,
        configurable: true,
    },
    cloneNode: {
        value(this: Node, deep?: boolean): Node {
            if (isNodeShadowed(this) || isHostElement(this)) {
                return cloneNodePatched.call(this, deep);
            }
            // TODO: issue #1222 - remove global bypass
            if (isGlobalPatchingSkipped(this)) {
                return cloneNode.call(this, deep);
            }
            return cloneNodePatched.call(this, deep);
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
});

let internalChildNodeAccessorFlag = false;

/**
 * These 2 methods are providing a machinery to understand who is accessing the
 * .childNodes member property of a node. If it is used from inside the synthetic shadow
 * or from an external invoker. This helps to produce the right output in one very peculiar
 * case, the IE11 debugging comment for shadowRoot representation on the devtool.
 */
export function isExternalChildNodeAccessorFlagOn(): boolean {
    return !internalChildNodeAccessorFlag;
}
export const getInternalChildNodes =
    process.env.NODE_ENV !== 'production' && isFalse(hasNativeSymbolsSupport)
        ? function(node: Node): NodeListOf<ChildNode> {
              internalChildNodeAccessorFlag = true;
              let childNodes;
              let error = null;
              try {
                  childNodes = node.childNodes;
              } catch (e) {
                  // childNodes accessor should never throw, but just in case!
                  error = e;
              } finally {
                  internalChildNodeAccessorFlag = false;
                  if (!isNull(error)) {
                      // re-throwing after restoring the state machinery for setInternalChildNodeAccessorFlag
                      throw error; // eslint-disable-line no-unsafe-finally
                  }
              }
              return childNodes;
          }
        : function(node: Node): NodeListOf<ChildNode> {
              return node.childNodes;
          };

// IE11 extra patches for wrong prototypes
if (hasOwnProperty.call(HTMLElement.prototype, 'contains')) {
    defineProperty(HTMLElement.prototype, 'contains', getOwnPropertyDescriptor(
        Node.prototype,
        'contains'
    ) as PropertyDescriptor);
}

if (hasOwnProperty.call(HTMLElement.prototype, 'parentElement')) {
    defineProperty(HTMLElement.prototype, 'parentElement', getOwnPropertyDescriptor(
        Node.prototype,
        'parentElement'
    ) as PropertyDescriptor);
}
