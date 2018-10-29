import assert from "../shared/assert";
import {
    getNodeKey,
    getNodeNearestOwnerKey,
} from "./node";
import {
    parentNodeGetter as nativeParentNodeGetter,
    childNodesGetter as nativeChildNodesGetter,
    textContextSetter,
    parentNodeGetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
    parentElementGetter,
} from "../env/node";
import {
    querySelectorAll, innerHTMLSetter, getAttribute, tagNameGetter,
} from "../env/element";
import { elementsFromPoint } from "../env/document";
import { wrapIframeWindow } from "./iframe";
import {
    ArrayReduce,
    ArrayPush,
    isUndefined,
    ArrayFilter,
    isTrue,
    getPrototypeOf,
} from "../shared/language";
import { isNull } from "../shared/language";
import { getOuterHTML } from "../3rdparty/polymer/outer-html";
import { getTextContent } from "../3rdparty/polymer/text-content";
import { getInnerHTML } from "../3rdparty/polymer/inner-html";
import { getHost, getShadowRoot, SyntheticShadowRootInterface } from "./shadow-root";
import { HTMLElementConstructor, NodeConstructor, HTMLSlotElementConstructor, HTMLIFrameElementConstructor } from "../framework/base-bridge-element";
import { SyntheticNodeList } from "./node-list";
import { iFrameContentWindowGetter } from "../env/dom";

// TODO: remove after TS 3.x upgrade.
export interface GetRootNodeOptions {
    composed?: boolean;
}

function getNodeOwner(node: Node): HTMLElement | null {
    if (!(node instanceof Node)) {
        return null;
    }
    const ownerKey = getNodeNearestOwnerKey(node);
    if (isUndefined(ownerKey)) {
        return null;
    }
    // At this point, node is a valid node with owner identity, now we need to find the owner node
    // search for a custom element with a VM that owns the first element with owner identity attached to it
    while (!isNull(node) && (getNodeKey(node) !== ownerKey)) {
        node = parentNodeGetter.call(node);
    }
    if (isNull(node)) {
        return null;
    }
    return node as HTMLElement;
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

export function isNodeSlotted(host: Element, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(host instanceof HTMLElement, `isNodeSlotted() should be called with a host as the first argument instead of ${host}`);
        assert.invariant(node instanceof Node, `isNodeSlotted() should be called with a node as the second argument instead of ${node}`);
        assert.isTrue(compareDocumentPosition.call(node, host) & DOCUMENT_POSITION_CONTAINS, `isNodeSlotted() should never be called with a node that is not a child node of ${host}`);
    }
    const hostKey = getNodeKey(host);
    // just in case the provided node is not an element
    let currentElement: Element = node instanceof HTMLElement ? node : parentElementGetter.call(node);
    while (!isNull(currentElement) && currentElement !== host) {
        const elmOwnerKey = getNodeNearestOwnerKey(currentElement);
        const parent: Element = parentElementGetter.call(currentElement);
        if (elmOwnerKey === hostKey) {
            // we have reached a host's node element, and only if
            // that element is an slot, then the node is considered slotted
            return isSlotElement(currentElement);
        } else if (parent !== host && getNodeNearestOwnerKey(parent) !== elmOwnerKey) {
            // we are crossing a boundary of some sort since the elm and its parent
            // have different owner key. for slotted elements, this is only possible
            // if the parent happens to be a slot that is not owned by the host
            if (!isSlotElement(parent)) {
                return false;
            }
        }
        currentElement = parent;
    }
    return false;
}

function getShadowParent(node: Node, value: undefined | HTMLElement): Node | null {
    const owner = getNodeOwner(node);
    if (value === owner) {
        // walking up via parent chain might end up in the shadow root element
        return getShadowRoot(owner) as Node;
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

export function shadowRootChildNodes(root: SyntheticShadowRootInterface): SyntheticNodeList<Element & Node> {
    const elm = getHost(root);
    return getAllMatches(elm, nativeChildNodesGetter.call(elm));
}

function getAllMatches(owner: HTMLElement, nodeList: NodeList | Node[]): SyntheticNodeList<Element & Node> {
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
    return new SyntheticNodeList(filteredAndPatched);
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

function getAllSlottedMatches(host: HTMLElement, nodeList: NodeList | Node[]): SyntheticNodeList<Node & Element> {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            ArrayPush.call(filteredAndPatched, node);
        }
    }
    return new SyntheticNodeList(filteredAndPatched);
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

export function shadowDomElementFromPoint(host: HTMLElement, left: number, top: number): Element | null {
    return getFirstMatch(host, elementsFromPoint.call(document, left, top));
}

export function lightDomQuerySelectorAll(elm: Element, selectors: string): SyntheticNodeList<Element> {
    const owner = getNodeOwner(elm);
    if (isNull(owner)) {
        return new SyntheticNodeList([]);
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

export function lightDomQuerySelector(elm: Element, selector: string): Element | null {
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

export function shadowRootQuerySelectorAll(root: SyntheticShadowRootInterface, selector: string): SyntheticNodeList<Element> {
    const elm = getHost(root);
    const nodeList = querySelectorAll.call(elm, selector);
    return getAllMatches(elm, nodeList);
}

function getFilteredSlotAssignedNodes(slot: HTMLElement): Node[] {
    const owner = getNodeOwner(slot);
    if (isNull(owner)) {
        return [];
    }
    return ArrayReduce.call(nativeChildNodesGetter.call(slot), (seed, child) => {
        if (!isNodeOwnedBy(owner, child)) {
            ArrayPush.call(seed, child);
        }
        return seed;
    }, []);
}

function getFilteredSlotFlattenNodes(slot: HTMLElement): Node[] {
    return ArrayReduce.call(nativeChildNodesGetter.call(slot), (seed, child) => {
        if (child instanceof Element && isSlotElement(child)) {
            ArrayPush.apply(seed, getFilteredSlotFlattenNodes(child as HTMLElement));
        } else {
            ArrayPush.call(seed, child);
        }
        return seed;
    }, []);
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
    return ArrayReduce.call(children, (seed, child) => {
        if (isNodeOwnedBy(owner, child)) {
            ArrayPush.call(seed, child);
        }
        return seed;
    }, []);
}

interface AssignedNodesOptions {
    flatten?: boolean;
}

export function PatchedNode(node: Node): NodeConstructor {
    const Ctor: NodeConstructor = getPrototypeOf(node).constructor;
    return class extends Ctor {
        get childNodes(this: Node): SyntheticNodeList<Node & Element> {
            const owner = getNodeOwner(this);
            if (isNull(owner)) {
                return new SyntheticNodeList([]);
            }
            return getAllMatches(owner, getFilteredChildNodes(this));
        }
        get assignedSlot(this: Node): HTMLElement | null {
            const parentNode: HTMLElement = nativeParentNodeGetter.call(this);
            /**
             * if it doesn't have a parent node,
             * or the parent is not an slot element
             * or they both belong to the same template (default content)
             * we should assume that it is not slotted
             */
            if (isNull(parentNode) || !isSlotElement(parentNode) || getNodeNearestOwnerKey(parentNode) === getNodeNearestOwnerKey(this)) {
                return null;
            }
            return parentNode as HTMLElement;
        }
        get textContent(this: Node): string {
            return getTextContent(this);
        }
        set textContent(this: Node, value: string) {
            textContextSetter.call(this, value);
        }
        get parentNode(this: Node): Node | null {
            const value = nativeParentNodeGetter.call(this);
            if (isNull(value)) {
                return value;
            }
            return getShadowParent(this, value);
        }
        get parentElement(this: Node): HTMLElement | null {
            const parentNode: HTMLElement | null = nativeParentNodeGetter.call(this);
            if (isNull(parentNode)) {
                return null;
            }
            const nodeOwner = getNodeOwner(this);
            if (isNull(nodeOwner)) {
                return parentNode;
            }
            // If we have traversed to the host element,
            // we need to return null
            if (nodeOwner === parentNode) {
                return null;
            }
            return parentNode;
        }
        getRootNode(this: Node, options?: GetRootNodeOptions): Node {
            return getRootNodeGetter.call(this, options);
        }
    };
}

export function PatchedElement(elm: HTMLElement): HTMLElementConstructor {
    const Ctor = PatchedNode(elm) as HTMLElementConstructor;
    // @ts-ignore type-mismatch
    return class PatchedHTMLElement extends Ctor {
        querySelector(this: Element, selector: string): Element | null {
            return lightDomQuerySelector(this, selector);
        }
        querySelectorAll(this: Element, selectors: string): SyntheticNodeList<Element> {
            return lightDomQuerySelectorAll(this, selectors);
        }
        get innerHTML(): string {
            return getInnerHTML(this);
        }
        set innerHTML(value: string) {
            innerHTMLSetter.call(this, value);
        }
        get outerHTML() {
            return getOuterHTML(this);
        }
        // ParentNode.prototype
        get childElementCount(this: HTMLElement) {
            return this.children.length;
        }
        // All these methods are expecting to return HTMLCollection
        get children(this: Element) {
            const owner = getNodeOwner(this);
            const childNodes = isNull(owner) ? new SyntheticNodeList([]) : getAllMatches(owner, getFilteredChildNodes(this));
            const children: Element[] = [];
            for (let i = 0; i < childNodes.length; i += 1) {
                const node: Node = childNodes[i];
                if (node instanceof Element) {
                    ArrayPush.apply(children, node as Element);
                }
            }
            return new SyntheticNodeList(children);
        }
        get firstElementChild(this: Element) {
            return this.children[0] || null;
        }
        get lastElementChild(this: Element) {
            const { children } = this;
            return children.item(children.length - 1) || null;
        }
        getElementsByClassName(this: Element, names: string) {
            const query = names.split(' ').map((name) => '.' + name.trim()).join(',');
            // we should probably be more restrictive here
            return query === '' ? new SyntheticNodeList([]) :  lightDomQuerySelectorAll(this, query);
        }
        getElementsByTagName(this: Element, tagNameOrWildCard: string) {
            const query = tagNameOrWildCard === '*' ? '*' : '#' + tagNameOrWildCard;
            // we should probably be more restrictive here
            return query === '#' ? new SyntheticNodeList([]) :  lightDomQuerySelectorAll(this, query);
        }
    };
}

export function PatchedSlotElement(elm: HTMLSlotElement): HTMLSlotElementConstructor {
    const Ctor = PatchedElement(elm) as HTMLSlotElementConstructor;
    return class PatchedHTMLSlotElement extends Ctor {
        assignedElements(this: HTMLSlotElement, options?: AssignedNodesOptions): Element[] {
            const flatten = !isUndefined(options) && isTrue(options.flatten);
            const nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
            return ArrayFilter.call(nodes, node => node instanceof Element);
        }
        assignedNodes(this: HTMLSlotElement, options?: AssignedNodesOptions): Node[] {
            const flatten = !isUndefined(options) && isTrue(options.flatten);
            return flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
        }
        get name(this: HTMLSlotElement): string {
            // in browsers that do not support shadow dom, slot's name attribute is not reflective
            const name = getAttribute.call(this, 'name');
            return isNull(name) ? '' : name;
        }
    };
}

export function PatchedIframeElement(elm: HTMLIFrameElement): HTMLIFrameElementConstructor {
    const Ctor = PatchedElement(elm) as HTMLIFrameElementConstructor;
    return class PatchedHTMLIframeElement extends Ctor {
        get contentWindow(this: HTMLIFrameElement) {
            const original = iFrameContentWindowGetter.call(this);
            if (original) {
                return wrapIframeWindow(original);
            }
            return original;
        }
    };
}
