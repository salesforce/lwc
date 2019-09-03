/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayReduce, ArrayPush, ArraySlice, assert, isNull, isUndefined } from '@lwc/shared';
import { getNodeKey, getNodeNearestOwnerKey } from './node';
import {
    childNodesGetter,
    parentNodeGetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
} from '../env/node';
import { querySelectorAll } from '../env/element';
import {
    getHost,
    SyntheticShadowRootInterface,
    isHostElement,
    getShadowRootResolver,
    getShadowRoot,
} from './shadow-root';

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
    return getAllMatches(elm, childNodesGetter.call(elm));
}

export function getAllMatches(owner: Element, nodeList: NodeList | Node[]): Array<Element & Node> {
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

export function getFirstMatch(owner: Element, nodeList: NodeList): Element | null {
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
    const nodeList = querySelectorAll.call(elm, selector);
    return getFirstMatch(elm, nodeList);
}

export function shadowRootQuerySelectorAll(
    root: SyntheticShadowRootInterface,
    selector: string
): Element[] {
    const elm = getHost(root);
    const nodeList = querySelectorAll.call(elm, selector);
    return getAllMatches(elm, nodeList);
}

export function getFilteredChildNodes(node: Node): Element[] {
    let children;
    if (!isHostElement(node) && !isSlotElement(node)) {
        // regular element - fast path
        children = childNodesGetter.call(node);
        return ArraySlice.call(children);
    }
    if (isHostElement(node)) {
        // we need to get only the nodes that were slotted
        const slots = querySelectorAll.call(node, 'slot');
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
        children = childNodesGetter.call(node);
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
    const childNodes = ArraySlice.call(childNodesGetter.call(slot)) as Node[];
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
