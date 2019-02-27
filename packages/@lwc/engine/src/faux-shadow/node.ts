/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    isNull,
    forEach,
    getPrototypeOf,
    setPrototypeOf,
    isFalse,
} from '../shared/language';
import {
    parentNodeGetter,
    textContextSetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINED_BY,
    parentNodeGetter as nativeParentNodeGetter,
    cloneNode as nativeCloneNode,
} from '../env/node';
import { MutationObserver, MutationObserverObserve } from '../env/mutation-observer';
import { setAttribute } from '../env/element';
import { getNodeOwner, isSlotElement, getRootNodeGetter, isNodeOwnedBy } from './traverse';
import { NodeConstructor } from '../framework/base-bridge-element';
import { getTextContent } from '../3rdparty/polymer/text-content';
import { getShadowRoot } from './shadow-root';

// DO NOT CHANGE this:
// these two values need to be in sync with framework/vm.ts
const OwnerKey = '$$OwnerKey$$';
const OwnKey = '$$OwnKey$$';

export const hasNativeSymbolsSupport = Symbol('x').toString() === 'Symbol(x)';

export function getNodeOwnerKey(node: Node): number | undefined {
    return node[OwnerKey];
}

export function setNodeOwnerKey(node: Node, key: number) {
    node[OwnerKey] = key;
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

const portals: WeakMap<Element, 1> = new WeakMap();

// We can use a single observer without having to worry about leaking because
// "Registered observers in a node’s registered observer list have a weak
// reference to the node."
// https://dom.spec.whatwg.org/#garbage-collection
let portalObserver;

const portalObserverConfig: MutationObserverInit = {
    childList: true,
    subtree: true,
};

function patchPortalElement(node: Node, ownerKey: number, shadowToken: string | undefined) {
    // If node already has an ownerKey, we can skip
    // Note: checking if a node has any ownerKey is not enough
    // because this element could be moved from one
    // shadow to another
    if (getNodeOwnerKey(node) === ownerKey) {
        return;
    }
    setNodeOwnerKey(node, ownerKey);
    if (node instanceof Element) {
        setCSSToken(node, shadowToken);
        const childNodes = getInternalChildNodes(node);
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            const child = childNodes[i];
            patchPortalElement(child, ownerKey, shadowToken);
        }
    }
}

function initPortalObserver() {
    return new MutationObserver(mutations => {
        forEach.call(mutations, mutation => {
            const { target: elm, addedNodes } = mutation;
            const ownerKey = getNodeOwnerKey(elm);
            const shadowToken = getCSSToken(elm);

            // OwnerKey might be undefined at this point.
            // We used to throw an error here, but we need to return early instead.
            //
            // This routine results in a mutation target that will have no key
            // because its been removed by the time the observer runs

            // const div = document.createElement('div');
            // div.innerHTML = '<span>span</span>';
            // const span = div.querySelector('span');
            // manualElement.appendChild(div);
            // span.textContent = '';
            // span.parentNode.removeChild(span);
            if (isUndefined(ownerKey)) {
                return;
            }
            for (let i = 0, len = addedNodes.length; i < len; i += 1) {
                const node: Node = addedNodes[i];
                patchPortalElement(node, ownerKey, shadowToken);
            }
        });
    });
}

const ShadowTokenKey = '$$ShadowTokenKey$$';

export function setCSSToken(elm: Element, shadowToken: string | undefined) {
    if (!isUndefined(shadowToken)) {
        setAttribute.call(elm, shadowToken, '');
        elm[ShadowTokenKey] = shadowToken;
    }
}

function getCSSToken(elm: Element): string | undefined {
    return elm[ShadowTokenKey];
}

export function markElementAsPortal(elm: Element) {
    portals.set(elm, 1);
    if (!portalObserver) {
        portalObserver = initPortalObserver();
    }
    // install mutation observer for portals
    MutationObserverObserve.call(portalObserver, elm, portalObserverConfig);
}

export function isPortalElement(elm: Element): boolean {
    return portals.has(elm);
}

function getShadowParent(node: Node, value: undefined | Element): (Node & ParentNode) | null {
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

export function PatchedNode(node: Node): NodeConstructor {
    const Ctor: NodeConstructor = getPrototypeOf(node).constructor;
    class PatchedNodeClass {
        constructor() {
            // Patched classes are not supposed to be instantiated directly, ever!
            throw new TypeError('Illegal constructor');
        }
        hasChildNodes(this: Node) {
            return getInternalChildNodes(this).length > 0;
        }
        // @ts-ignore until ts@3.x
        get firstChild(this: Node): ChildNode | null {
            const childNodes = getInternalChildNodes(this);
            // @ts-ignore until ts@3.x
            return childNodes[0] || null;
        }
        // @ts-ignore until ts@3.x
        get lastChild(this: Node): ChildNode | null {
            const childNodes = getInternalChildNodes(this);
            // @ts-ignore until ts@3.x
            return childNodes[childNodes.length - 1] || null;
        }
        get textContent(this: Node): string {
            return getTextContent(this);
        }
        set textContent(this: Node, value: string) {
            textContextSetter.call(this, value);
        }
        get childElementCount(this: ParentNode) {
            return this.children.length;
        }
        get firstElementChild(this: ParentNode) {
            return this.children[0] || null;
        }
        get lastElementChild(this: ParentNode) {
            const { children } = this;
            return children.item(children.length - 1) || null;
        }
        get assignedSlot(this: Node): HTMLElement | null {
            const parentNode = nativeParentNodeGetter.call(this);
            /**
             * if it doesn't have a parent node,
             * or the parent is not an slot element
             * or they both belong to the same template (default content)
             * we should assume that it is not slotted
             */
            if (
                isNull(parentNode) ||
                !isSlotElement(parentNode) ||
                getNodeNearestOwnerKey(parentNode) === getNodeNearestOwnerKey(this)
            ) {
                return null;
            }
            return parentNode as HTMLElement;
        }
        get parentNode(this: Node): (Node & ParentNode) | null {
            const value = nativeParentNodeGetter.call(this);
            if (isNull(value)) {
                return value;
            }
            return getShadowParent(this, value);
        }
        get parentElement(this: Node): Element | null {
            const value = nativeParentNodeGetter.call(this);
            if (isNull(value)) {
                return null;
            }
            const parentNode = getShadowParent(this, value);
            // it could be that the parentNode is the shadowRoot, in which case
            // we need to return null.
            return parentNode instanceof Element ? parentNode : null;
        }
        compareDocumentPosition(this: Node, otherNode: Node) {
            if (getRootNodeGetter.call(this) === otherNode) {
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
        contains(this: Node, otherNode: Node) {
            if (getNodeOwnerKey(this) !== getNodeOwnerKey(otherNode)) {
                // it is from another shadow
                return false;
            }
            return (
                (compareDocumentPosition.call(this, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !==
                0
            );
        }
        cloneNode(this: Node, deep: boolean): Node {
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
    }
    // prototype inheritance dance
    setPrototypeOf(PatchedNodeClass, Ctor);
    setPrototypeOf(PatchedNodeClass.prototype, Ctor.prototype);
    return (PatchedNodeClass as any) as NodeConstructor;
}

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
