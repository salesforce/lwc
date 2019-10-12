/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayReduce, ArrayPush, assert, isNull, isUndefined } from '@lwc/shared';
import { getNodeKey, getNodeNearestOwnerKey } from '../shared/node-ownership';
import {
    childNodesGetter,
    parentNodeGetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
    parentElementGetter,
} from '../env/node';
import { querySelectorAll } from '../env/element';
import {
    getHost,
    SyntheticShadowRootInterface,
    isHostElement,
    getShadowRootResolver,
    getShadowRoot,
} from './shadow-root';
import { arrayFromCollection } from '../shared/utils';

// when finding a slot in the DOM, we can fold it if it is contained
// inside another slot.
function foldSlotElement(slot: HTMLElement) {
    let parent = parentElementGetter.call(slot);
    while (!isNull(parent) && isSlotElement(parent)) {
        slot = parent as HTMLElement;
        parent = parentElementGetter.call(slot);
    }
    return slot;
}

function isNodeSlotted(host: Element, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            host instanceof HTMLElement,
            `isNodeSlotted() should be called with a host as the first argument instead of ${host}`
        );
        assert.invariant(
            node instanceof Node,
            `isNodeSlotted() should be called with a node as the second argument instead of ${node}`
        );
        assert.invariant(
            compareDocumentPosition.call(node, host) & DOCUMENT_POSITION_CONTAINS,
            `isNodeSlotted() should never be called with a node that is not a child node of ${host}`
        );
    }
    const hostKey = getNodeKey(host);
    // this routine assumes that the node is coming from a different shadow (it is not owned by the host)
    // just in case the provided node is not an element
    let currentElement = node instanceof Element ? node : parentElementGetter.call(node);
    while (!isNull(currentElement) && currentElement !== host) {
        const elmOwnerKey = getNodeNearestOwnerKey(currentElement);
        const parent = parentElementGetter.call(currentElement);
        if (elmOwnerKey === hostKey) {
            // we have reached an element inside the host's template, and only if
            // that element is an slot, then the node is considered slotted
            return isSlotElement(currentElement);
        } else if (parent === host) {
            return false;
        } else if (!isNull(parent) && getNodeNearestOwnerKey(parent) !== elmOwnerKey) {
            // we are crossing a boundary of some sort since the elm and its parent
            // have different owner key. for slotted elements, this is possible
            // if the parent happens to be a slot.
            if (isSlotElement(parent)) {
                /**
                 * the slot parent might be allocated inside another slot, think of:
                 * <x-root> (<--- root element)
                 *    <x-parent> (<--- own by x-root)
                 *       <x-child> (<--- own by x-root)
                 *           <slot> (<--- own by x-child)
                 *               <slot> (<--- own by x-parent)
                 *                  <div> (<--- own by x-root)
                 *
                 * while checking if x-parent has the div slotted, we need to traverse
                 * up, but when finding the first slot, we skip that one in favor of the
                 * most outer slot parent before jumping into its corresponding host.
                 */
                currentElement = getNodeOwner(foldSlotElement(parent as HTMLElement));
                if (!isNull(currentElement)) {
                    if (currentElement === host) {
                        // the slot element is a top level element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    } else if (getNodeNearestOwnerKey(currentElement) === hostKey) {
                        // the slot element is an element inside the shadow
                        // of a host that was allocated into host in question
                        return true;
                    }
                }
            } else {
                return false;
            }
        } else {
            currentElement = parent;
        }
    }
    return false;
}

export function getNodeOwner(node: Node): HTMLElement | null {
    if (!(node instanceof Node)) {
        return null;
    }
    const ownerKey = getNodeNearestOwnerKey(node);
    if (isUndefined(ownerKey)) {
        return null;
    }
    let nodeOwner: Node | null = node;
    // At this point, node is a valid node with owner identity, now we need to find the owner node
    // search for a custom element with a VM that owns the first element with owner identity attached to it
    while (!isNull(nodeOwner) && getNodeKey(nodeOwner) !== ownerKey) {
        nodeOwner = parentNodeGetter.call(nodeOwner);
    }
    if (isNull(nodeOwner)) {
        return null;
    }
    return nodeOwner as HTMLElement;
}

export function isSlotElement(node: Node): node is HTMLSlotElement {
    return node instanceof HTMLSlotElement;
}

export function isNodeOwnedBy(owner: Element, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            owner instanceof HTMLElement,
            `isNodeOwnedBy() should be called with an element as the first argument instead of ${owner}`
        );
        assert.invariant(
            node instanceof Node,
            `isNodeOwnedBy() should be called with a node as the second argument instead of ${node}`
        );
        assert.invariant(
            compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS,
            `isNodeOwnedBy() should never be called with a node that is not a child node of ${owner}`
        );
    }
    const ownerKey = getNodeNearestOwnerKey(node);
    return isUndefined(ownerKey) || getNodeKey(owner) === ownerKey;
}

export function shadowRootChildNodes(root: SyntheticShadowRootInterface): Array<Element & Node> {
    const elm = getHost(root);
    return getAllMatches(elm, arrayFromCollection(childNodesGetter.call(elm)));
}

export function getAllSlottedMatches<T extends Node>(
    host: Element,
    nodeList: NodeList | Node[]
): Array<T> {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return filteredAndPatched;
}

export function getFirstSlottedMatch(host: Element, nodeList: Element[]): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i] as Element;
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            return node;
        }
    }
    return null;
}

export function getAllMatches<T extends Node>(owner: Element, nodeList: Node[]): Array<T> {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        const isOwned = isNodeOwnedBy(owner, node);
        if (isOwned) {
            // Patch querySelector, querySelectorAll, etc
            // if element is owned by VM
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return filteredAndPatched;
}

export function getFirstMatch(owner: Element, nodeList: Element[]): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedBy(owner, nodeList[i])) {
            return nodeList[i] as Element;
        }
    }
    return null;
}

export function shadowRootQuerySelector(
    root: SyntheticShadowRootInterface,
    selector: string
): Element | null {
    const elm = getHost(root);
    const nodeList = arrayFromCollection(querySelectorAll.call(elm, selector));
    return getFirstMatch(elm, nodeList);
}

export function shadowRootQuerySelectorAll(
    root: SyntheticShadowRootInterface,
    selector: string
): Element[] {
    const elm = getHost(root);
    const nodeList = querySelectorAll.call(elm, selector);
    return getAllMatches(elm, arrayFromCollection(nodeList));
}

export function getFilteredChildNodes(node: Node): Element[] {
    let children;
    if (!isHostElement(node) && !isSlotElement(node)) {
        // regular element - fast path
        children = childNodesGetter.call(node);
        return arrayFromCollection(children);
    }
    if (isHostElement(node)) {
        // we need to get only the nodes that were slotted
        const slots = arrayFromCollection(querySelectorAll.call(node, 'slot'));
        const resolver = getShadowRootResolver(getShadowRoot(node as Element));
        // Typescript is inferring the wrong function type for this particular
        // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
        // @ts-ignore type-mismatch
        return ArrayReduce.call(
            slots,
            (seed, slot) => {
                if (resolver === getShadowRootResolver(slot)) {
                    ArrayPush.apply(seed, getFilteredSlotAssignedNodes(slot));
                }
                return seed;
            },
            []
        );
    } else {
        // slot element
        children = arrayFromCollection(childNodesGetter.call(node));
        const resolver = getShadowRootResolver(node);
        // Typescript is inferring the wrong function type for this particular
        // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
        // @ts-ignore type-mismatch
        return ArrayReduce.call(
            children,
            (seed, child) => {
                if (resolver === getShadowRootResolver(child)) {
                    ArrayPush.call(seed, child);
                }
                return seed;
            },
            []
        );
    }
}

export function getFilteredSlotAssignedNodes(slot: HTMLElement): Node[] {
    const owner = getNodeOwner(slot);
    if (isNull(owner)) {
        return [];
    }
    const childNodes = arrayFromCollection(childNodesGetter.call(slot));
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    return ArrayReduce.call(
        childNodes,
        (seed, child) => {
            if (!isNodeOwnedBy(owner, child)) {
                ArrayPush.call(seed, child);
            }
            return seed;
        },
        []
    );
}
