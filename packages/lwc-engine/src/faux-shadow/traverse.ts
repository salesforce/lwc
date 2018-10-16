import assert from "../shared/assert";
import {
    parentNodeGetter as nativeParentNodeGetter,
    childNodesGetter as nativeChildNodesGetter,
    textContextSetter,
    parentNodeGetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
    getNodeKey,
    getNodeOwnerKey,
} from "./node";
import {
    querySelectorAll as nativeQuerySelectorAll, innerHTMLSetter, getAttribute, tagNameGetter,
} from "./element";
import { wrapIframeWindow } from "./iframe";
import {
    defineProperty,
    ArrayReduce,
    isFalse,
    ArrayPush,
    assign,
    isUndefined,
    toString,
    ArrayFilter,
    isTrue,
    ArrayMap,
    create,
} from "../shared/language";
import { getOwnPropertyDescriptor, isNull } from "../shared/language";
import { wrap as traverseMembraneWrap, contains as traverseMembraneContains } from "./traverse-membrane";
import { getOuterHTML } from "../3rdparty/polymer/outer-html";
import { getTextContent } from "../3rdparty/polymer/text-content";
import { getInnerHTML } from "../3rdparty/polymer/inner-html";
import { getHost, getShadowRoot } from "./shadow-root";
import { parentElementGetter } from "../framework/dom-api";

const iFrameContentWindowGetter: (this: HTMLIFrameElement) => Window = getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')!.get!;

function getNodeOwner(node: Node): HTMLElement | null {
    if (!(node instanceof Node)) {
        return null;
    }
    const ownerKey = getNodeOwnerKey(node);
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

function isSlotElement(elm: Element): boolean {
    return tagNameGetter.call(elm) === 'SLOT';
}

export function isNodeOwnedBy(owner: HTMLElement, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(owner instanceof HTMLElement, `isNodeOwnedBy() should be called with an element as the first argument instead of ${owner}`);
        assert.invariant(node instanceof Node, `isNodeOwnedBy() should be called with a node as the second argument instead of ${node}`);
        assert.isTrue(compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS, `isNodeOwnedBy() should never be called with a node that is not a child node of ${owner}`);
    }
    const ownerKey = getNodeOwnerKey(node);
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
        const elmOwnerKey = getNodeOwnerKey(currentElement);
        const parent: Element = parentElementGetter.call(currentElement);
        if (elmOwnerKey === hostKey) {
            // we have reached a host's node element, and only if
            // that element is an slot, then the node is considered slotted
            return isSlotElement(currentElement);
        } else if (parent !== host && getNodeOwnerKey(parent) !== elmOwnerKey) {
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

function getShadowParent(node: HTMLElement, value: undefined | HTMLElement): ShadowRoot | HTMLElement | null {
    const owner = getNodeOwner(node);
    if (value === owner) {
        // walking up via parent chain might end up in the shadow root element
        return getShadowRoot(owner);
    } else if (value instanceof Element) {
        if (getNodeOwnerKey(node) === getNodeOwnerKey(value)) {
            // the element and its parent node belong to the same shadow root
            return patchShadowDomTraversalMethods(value);
        } else if (!isNull(owner) && isSlotElement(value)) {
            // slotted elements must be top level childNodes of the slot element
            // where they slotted into, but its shadowed parent is always the
            // owner of the slot.
            const slotOwner = getNodeOwner(value);
            if (!isNull(slotOwner) && isNodeOwnedBy(owner, slotOwner)) {
                // it is a slotted element, and therefore its parent is always going to be the host of the slot
                return patchShadowDomTraversalMethods(slotOwner);
            }
        }
    }
    return null;
}

function parentNodeDescriptorValue(this: HTMLElement): HTMLElement | ShadowRoot | null {
    const value = nativeParentNodeGetter.call(this);
    if (isNull(value)) {
        return value;
    }
    return getShadowParent(this, value);
}

function parentElementDescriptorValue(this: HTMLElement): HTMLElement | null {
    const parentNode = parentNodeDescriptorValue.call(this);
    const ownerShadow = getShadowRoot(getNodeOwner(this) as HTMLElement);
    // If we have traversed to the host element,
    // we need to return null
    if (ownerShadow === parentNode) {
        return null;
    }
    return parentNode;
}

export function shadowRootChildNodes(root: ShadowRoot) {
    const elm = getHost(root);
    return getAllMatches(elm, nativeChildNodesGetter.call(elm));
}

function getAllMatches(owner: HTMLElement, nodeList: NodeList | Node[]): Element[] {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        const isOwned = isNodeOwnedBy(owner, node);
        if (isOwned) {
            // Patch querySelector, querySelectorAll, etc
            // if element is owned by VM
            ArrayPush.call(filteredAndPatched, patchShadowDomTraversalMethods(node));
        }
    }
    return filteredAndPatched;
}

function getFirstMatch(owner: HTMLElement, nodeList: NodeList): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        if (isNodeOwnedBy(owner, nodeList[i])) {
            return patchShadowDomTraversalMethods(nodeList[i] as Element);
        }
    }
    return null;
}

function getAllSlottedMatches(host: HTMLElement, nodeList: NodeList | Node[]): Element[] {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            ArrayPush.call(filteredAndPatched, patchShadowDomTraversalMethods(node));
        }
    }
    return filteredAndPatched;
}

function getFirstSlottedMatch(host: HTMLElement, nodeList: NodeList): Element | null {
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i] as Element;
        if (!isNodeOwnedBy(host, node) && isNodeSlotted(host, node)) {
            return patchShadowDomTraversalMethods(node);
        }
    }
    return null;
}

export function lightDomQuerySelectorAll(elm: Element, selector: string): Element[] {
    const owner = getNodeOwner(elm);
    if (isNull(owner)) {
        return [];
    }
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
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
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
    if (getNodeKey(elm)) {
        // it is a custom element, and we should then filter by slotted elements
        return getFirstSlottedMatch(elm as HTMLElement, nodeList);
    } else {
        // regular element, we should then filter by ownership
        return getFirstMatch(owner, nodeList);
    }
}

function lightDomQuerySelectorAllValue(this: HTMLElement, selector: string): Element[] {
    return lightDomQuerySelectorAll(this, selector);
}

function lightDomQuerySelectorValue(this: HTMLElement, selector: string): Element | null {
    return lightDomQuerySelector(this, selector);
}

export function shadowRootQuerySelector(root: ShadowRoot, selector: string): Element | null {
    const elm = getHost(root);
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
    return getFirstMatch(elm, nodeList);
}

export function shadowRootQuerySelectorAll(root: ShadowRoot, selector: string): Element[] {
    const elm = getHost(root);
    const nodeList = nativeQuerySelectorAll.call(elm, selector);
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
        const slots = nativeQuerySelectorAll.call(node, 'slot');
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

function lightDomChildNodesGetter(this: HTMLElement): Node[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.logWarning(
            `childNodes on ${toString(this)} returns a live NodeList which is not stable. Use querySelectorAll instead.`,
            this
        );
    }
    const owner = getNodeOwner(this);
    if (isNull(owner)) {
        return [];
    }
    return getAllMatches(owner, getFilteredChildNodes(this));
}

function lightDomInnerHTMLGetter(this: Element): string {
    return getInnerHTML(this);
}

function lightDomOuterHTMLGetter(this: Element): string {
    return getOuterHTML(this);
}

function lightDomTextContentGetter(this: Node): string {
    return getTextContent(this);
}

function assignedSlotGetter(this: Node): HTMLElement | null {
    const parentNode: HTMLElement = nativeParentNodeGetter.call(this);
    /**
     * if it doesn't have a parent node,
     * or the parent is not an slot element
     * or they both belong to the same template (default content)
     * we should assume that it is not slotted
     */
    if (isNull(parentNode) || !isSlotElement(parentNode) || getNodeOwnerKey(parentNode) === getNodeOwnerKey(this)) {
        return null;
    }
    return patchShadowDomTraversalMethods(parentNode as HTMLElement);
}

interface AssignedNodesOptions {
    flatten?: boolean;
}

function slotAssignedNodesValue(this: HTMLElement, options?: AssignedNodesOptions): Node[] {
    const flatten = !isUndefined(options) && isTrue(options.flatten);
    const nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
    return ArrayMap.call(nodes, patchShadowDomTraversalMethods);
}

function slotAssignedElementsValue(this: HTMLElement, options?: AssignedNodesOptions): Element[] {
    const flatten = !isUndefined(options) && isTrue(options.flatten);
    const nodes = flatten ? getFilteredSlotFlattenNodes(this) : getFilteredSlotAssignedNodes(this);
    const elements: Element[] = ArrayFilter.call(nodes, node => node instanceof Element);
    return ArrayMap.call(elements, patchShadowDomTraversalMethods);
}

function slotNameGetter(this: HTMLElement): string {
    const name = getAttribute.call(this, 'name');
    return isNull(name) ? '' : name;
}

export const NodePatchDescriptors: PropertyDescriptorMap = {
    childNodes: {
        get: lightDomChildNodesGetter,
        configurable: true,
        enumerable: true,
    },
    assignedSlot: {
        get: assignedSlotGetter,
        configurable: true,
        enumerable: true,
    },
    textContent: {
        get: lightDomTextContentGetter,
        set: textContextSetter,
        configurable: true,
        enumerable: true,
    },
    parentNode: {
        get: parentNodeDescriptorValue,
        configurable: true,
    },
    parentElement: {
        get: parentElementDescriptorValue,
        configurable: true,
    },
};

export const ElementPatchDescriptors: PropertyDescriptorMap = assign(create(null), NodePatchDescriptors, {
    querySelector: {
        value: lightDomQuerySelectorValue,
        configurable: true,
        enumerable: true,
        writable: true,
    },
    querySelectorAll: {
        value: lightDomQuerySelectorAllValue,
        configurable: true,
        enumerable: true,
        writable: true,
    },
    innerHTML: {
        get: lightDomInnerHTMLGetter,
        set: innerHTMLSetter,
        configurable: true,
        enumerable: true,
    },
    outerHTML: {
        get: lightDomOuterHTMLGetter,
        configurable: true,
        enumerable: true,
    },
});

export const SlotPatchDescriptors: PropertyDescriptorMap = assign(create(null), ElementPatchDescriptors, {
    assignedElements: {
        value: slotAssignedElementsValue,
        configurable: true,
        enumerable: true,
        writable: true,
    },
    assignedNodes: {
        value: slotAssignedNodesValue,
        configurable: true,
        enumerable: true,
        writable: true,
    },
    name: {
        // in browsers that do not support shadow dom, slot's name attribute is not reflective
        get: slotNameGetter,
        configurable: true,
        enumerable: true,
    },
});

const contentWindowDescriptor: PropertyDescriptor = {
    get(this: HTMLIFrameElement) {
        const original = iFrameContentWindowGetter.call(this);
        if (original) {
            return wrapIframeWindow(original);
        }
        return original;
    },
    configurable: true,
};

function nodeIsPatched(node: Node): boolean {
    // TODO: Remove comment once membrane is gone
    // return isFalse(hasOwnProperty.call(node, 'querySelector'));
    return traverseMembraneContains(node);
}

function patchDomNode<T extends Node>(node: T): T {
    return traverseMembraneWrap(node);
}

// For the time being, we have to use a proxy to get Shadow Semantics.
// The other possibility is to monkey patch the element itself, but this
// is very difficult to integrate because almost no integration tests
// understand what to do with shadow root. Using a Proxy here allows us
// to enforce shadow semantics from within components and still allows browser
// to use "light" apis as expected.
export function patchShadowDomTraversalMethods<T extends Node>(node: T): T {
    // Patching is done at the HTMLElement instance level.
    // Avoid monkey patching shadow methods twice for perf reasons.
    // If the node has querySelector defined on it, we have already
    // seen it and can move on.
    if (isFalse(nodeIsPatched(node as Node)) && node instanceof Element) {
        if (tagNameGetter.call(node) === 'IFRAME') {
            // We need to patch iframe.contentWindow because raw access to the contentWindow
            // Will break in compat mode
            defineProperty(node, 'contentWindow', contentWindowDescriptor);
        }
    }
    return patchDomNode(node);
}
