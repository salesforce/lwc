/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from "../shared/assert";
import {
    getNodeKey,
    getNodeNearestOwnerKey,
    PatchedNode,
    getInternalChildNodes,
} from "./node";
import {
    childNodesGetter as nativeChildNodesGetter,
    parentNodeGetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
    parentElementGetter,
} from "../env/node";
import {
    querySelectorAll, innerHTMLSetter, tagNameGetter,
} from "../env/element";
import { wrapIframeWindow } from "./iframe";
import {
    ArrayReduce,
    ArrayPush,
    isUndefined,
    isTrue,
} from "../shared/language";
import { isNull } from "../shared/language";
import { getOuterHTML } from "../3rdparty/polymer/outer-html";
import { getHost, getShadowRoot, SyntheticShadowRootInterface } from "./shadow-root";
import { HTMLElementConstructor, HTMLIFrameElementConstructor } from "../framework/base-bridge-element";
import { createStaticNodeList } from "../shared/static-node-list";
import { iFrameContentWindowGetter } from "../env/dom";
import { getFilteredSlotAssignedNodes } from "./slot";

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
    while (!isNull(nodeOwner) && (getNodeKey(nodeOwner) !== ownerKey)) {
        nodeOwner = parentNodeGetter.call(nodeOwner);
    }
    if (isNull(nodeOwner)) {
        return null;
    }
    return nodeOwner as HTMLElement;
}

export function isSlotElement(elm: Element): boolean {
    return tagNameGetter.call(elm) === 'SLOT';
}

export function isNodeOwnedBy(owner: HTMLElement, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(owner instanceof HTMLElement, `isNodeOwnedBy() should be called with an element as the first argument instead of ${owner}`);
        assert.invariant(node instanceof Node, `isNodeOwnedBy() should be called with a node as the second argument instead of ${node}`);
        assert.isTrue(compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS, `isNodeOwnedBy() should never be called with a node that is not a child node of ${owner}`);
    }
    const ownerKey = getNodeNearestOwnerKey(node);
    return isUndefined(ownerKey) || getNodeKey(owner) === ownerKey;
}

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
        assert.invariant(host instanceof HTMLElement, `isNodeSlotted() should be called with a host as the first argument instead of ${host}`);
        assert.invariant(node instanceof Node, `isNodeSlotted() should be called with a node as the second argument instead of ${node}`);
        assert.isTrue(compareDocumentPosition.call(node, host) & DOCUMENT_POSITION_CONTAINS, `isNodeSlotted() should never be called with a node that is not a child node of ${host}`);
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
            // TODO: add the examples
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

export function shadowRootChildNodes(root: SyntheticShadowRootInterface): Array<Element & Node> {
    const elm = getHost(root);
    return getAllMatches(elm, nativeChildNodesGetter.call(elm));
}

export function getAllMatches(owner: HTMLElement, nodeList: NodeList | Node[]): Array<Element & Node> {
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

function getRoot(node: Node): Node {
    const ownerNode = getNodeOwner(node);

    if (isNull(ownerNode)) {
        // we hit a wall, is not in lwc boundary.
        return getShadowIncludingRoot(node);
    }

    // @ts-ignore: Attributes property is removed from Node (https://developer.mozilla.org/en-US/docs/Web/API/Node)
    return getShadowRoot(ownerNode) as Node;
}

function getShadowIncludingRoot(node: Node): Node {
    let nodeParent;
    while (!isNull(nodeParent = parentNodeGetter.call(node))) {
        node = nodeParent;
    }

    return node;
}

/**
 * Dummy implementation of the Node.prototype.getRootNode.
 * Spec: https://dom.spec.whatwg.org/#dom-node-getrootnode
 *
 * TODO: Once we start using the real shadowDOM, this method should be replaced by:
 * const { getRootNode } = Node.prototype;
 */
export function getRootNodeGetter(
    this: Node,
    options?: GetRootNodeOptions
): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;

    return isTrue(composed) ?
        getShadowIncludingRoot(this) :
        getRoot(this);
}

function getFirstMatch(owner: HTMLElement, nodeList: NodeList): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedBy(owner, nodeList[i])) {
            return (nodeList[i] as Element);
        }
    }
    return null;
}

function getAllSlottedMatches(host: HTMLElement, nodeList: NodeList | Node[]): Array<Node & Element> {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return filteredAndPatched;
}

function getFirstSlottedMatch(host: HTMLElement, nodeList: NodeList): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i] as Element;
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            return node;
        }
    }
    return null;
}

function lightDomQuerySelectorAll(elm: Element, selectors: string): Element[] {
    const owner = getNodeOwner(elm);
    if (isNull(owner)) {
        return [];
    }
    const nodeList = querySelectorAll.call(elm, selectors);
    if (getNodeKey(elm)) {
        // it is a custom element, and we should then filter by slotted elements
        return getAllSlottedMatches(elm as HTMLElement, nodeList);
    } else {
        // regular element, we should then filter by ownership
        return getAllMatches(owner, nodeList);
    }
}

function lightDomQuerySelector(elm: Element, selector: string): Element | null {
    const owner = getNodeOwner(elm);
    if (isNull(owner)) {
        // the it is a root, and those can't have a lightdom
        return null;
    }
    const nodeList = querySelectorAll.call(elm, selector);
    if (getNodeKey(elm)) {
        // it is a custom element, and we should then filter by slotted elements
        return getFirstSlottedMatch(elm as HTMLElement, nodeList);
    } else {
        // regular element, we should then filter by ownership
        return getFirstMatch(owner, nodeList);
    }
}

export function shadowRootQuerySelector(root: SyntheticShadowRootInterface, selector: string): Element | null {
    const elm = getHost(root);
    const nodeList = querySelectorAll.call(elm, selector);
    return getFirstMatch(elm, nodeList);
}

export function shadowRootQuerySelectorAll(root: SyntheticShadowRootInterface, selector: string): Element[] {
    const elm = getHost(root);
    const nodeList = querySelectorAll.call(elm, selector);
    return getAllMatches(elm, nodeList);
}

export function getFilteredChildNodes(node: Node): Element[] {
    let children;
    if (!isUndefined(getNodeKey(node))) {
        // node itself is a custom element
        // lwc element, in which case we need to get only the nodes
        // that were slotted
        const slots = querySelectorAll.call(node, 'slot');
        children = ArrayReduce.call(slots, (seed, slot) => {
            if (isNodeOwnedBy(node as HTMLElement, slot)) {
                ArrayPush.apply(seed, getFilteredSlotAssignedNodes(slot));
            }
            return seed;
        }, []);
    } else {
        // regular element
        children = nativeChildNodesGetter.call(node);
    }
    const owner = getNodeOwner(node);
    if (isNull(owner)) {
        return [];
    }

    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    return ArrayReduce.call(children, (seed, child) => {
        if (isNodeOwnedBy(owner, child)) {
            ArrayPush.call(seed, child);
        }
        return seed;
    }, []);
}

export function PatchedElement(elm: HTMLElement): HTMLElementConstructor {
    const Ctor = PatchedNode(elm) as HTMLElementConstructor;
    return class PatchedHTMLElement extends Ctor {
        querySelector(this: Element, selector: string): Element | null {
            return lightDomQuerySelector(this, selector);
        }
        querySelectorAll(this: Element, selectors: string): NodeListOf<Element> {
            return createStaticNodeList(lightDomQuerySelectorAll(this, selectors));
        }
        get innerHTML(this: Element): string {
            const childNodes = getInternalChildNodes(this);
            let innerHTML = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                innerHTML += getOuterHTML(childNodes[i]);
            }
            return innerHTML;
        }
        set innerHTML(this: Element, value: string) {
            innerHTMLSetter.call(this, value);
        }
        get outerHTML() {
            return getOuterHTML(this);
        }
    };
}

export function PatchedIframeElement(elm: HTMLIFrameElement): HTMLIFrameElementConstructor {
    const Ctor = PatchedElement(elm) as HTMLIFrameElementConstructor;
    // @ts-ignore type-mismatch
    return class PatchedHTMLIframeElement extends Ctor {
        // @ts-ignore type-mismatch
        get contentWindow(this: HTMLIFrameElement) {
            const original = iFrameContentWindowGetter.call(this);
            if (original) {
                return wrapIframeWindow(original);
            }
            return original;
        }
    };
}
