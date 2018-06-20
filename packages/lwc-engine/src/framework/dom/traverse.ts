import assert from "../assert";
import { getNodeKey, getNodeOwnerKey } from "../vm";
import {
    parentNodeGetter as nativeParentNodeGetter,
    parentElementGetter as nativeParentElementGetter,
    childNodesGetter as nativeChildNodesGetter,
    textContextSetter,
    parentNodeGetter,
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINS,
} from "./node";
import {
    querySelectorAll as nativeQuerySelectorAll, innerHTMLSetter,
} from "./element";
import { wrapIframeWindow } from "./iframe";
import {
    defineProperty,
    ArrayReduce,
    ArraySlice,
    isFalse,
    ArrayPush,
    assign,
    isUndefined,
    toString,
} from "../language";
import { getOwnPropertyDescriptor, isNull } from "../language";
import { wrap as traverseMembraneWrap, contains as traverseMembraneContains } from "./traverse-membrane";
import { getOuterHTML } from "../../3rdparty/polymer/outer-html";
import { getTextContent } from "../../3rdparty/polymer/text-content";
import { getInnerHTML } from "../../3rdparty/polymer/inner-html";
import { getHost, getShadowRoot } from "./shadow-root";

export function getPatchedCustomElement(element: HTMLElement): HTMLElement {
    return traverseMembraneWrap(element);
}

const iFrameContentWindowGetter = getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow')!.get!;

function getNodeOwner(node: Node): HTMLElement | null {
    if (!(node instanceof Node)) {
        return null;
    }
    let ownerKey;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(node) && isUndefined((ownerKey = getNodeOwnerKey(node)))) {
        node = parentNodeGetter.call(node);
    }
    if (isUndefined(ownerKey) || isNull(node)) {
        return null;
    }
    // search for a custom element with a VM that owns the first element with owner identity attached to it
    while (!isNull(node) && (getNodeKey(node) !== ownerKey)) {
        node = parentNodeGetter.call(node);
    }
    if (isNull(node)) {
        return null;
    }
    return node as HTMLElement;
}

function isNodeOwnedBy(owner: HTMLElement, node: Node): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(node instanceof Node && owner instanceof HTMLElement, `isNodeOwnedByVM() should be called with a node as the second argument instead of ${node}`);
        assert.isTrue(compareDocumentPosition.call(node, owner) & DOCUMENT_POSITION_CONTAINS, `isNodeOwnedByVM() should never be called with a node that is not a child node of ${owner}`);
    }
    const ownerKey = getNodeOwnerKey(node);
    return isUndefined(ownerKey) || getNodeKey(owner) === ownerKey;
}

function getShadowParent(node: HTMLElement, value: undefined | HTMLElement): ShadowRoot | HTMLElement | null {
    const owner = getNodeOwner(node);
    if (value === owner) {
        // walking up via parent chain might end up in the shadow root element
        return getShadowRoot(owner);
    } else if (value instanceof Element && getNodeOwnerKey(node) === getNodeOwnerKey(value)) {
        // cutting out access to something outside of the shadow of the current target (usually slots)
        return patchShadowDomTraversalMethods(value);
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

function parentElementDescriptorValue(this: HTMLElement): HTMLElement | ShadowRoot | null {
    const value = nativeParentElementGetter.call(this);
    if (isNull(value)) {
        return value;
    }
    return getShadowParent(this, value);
}

export function shadowRootChildNodes(root: ShadowRoot) {
    const elm = getHost(root);
    return getAllMatches(elm, nativeChildNodesGetter.call(elm));
}

function getAllMatches(owner: HTMLElement, nodeList: NodeList | Element[]): Element[] {
    const filteredAndPatched = [];
    for (let i = 0, len = nodeList.length; i < len; i += 1) {
        const node = nodeList[i];
        const isOwned = isNodeOwnedBy(owner, node);
        if (isOwned) {
            // Patch querySelector, querySelectorAll, etc
            // if element is owned by VM
            ArrayPush.call(filteredAndPatched, patchShadowDomTraversalMethods(node as HTMLElement));
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

function lightDomQuerySelectorAllValue(this: HTMLElement, selector: string): Element[] {
    const owner = getNodeOwner(this);
    if (isNull(owner)) {
        return [];
    }
    const matches = nativeQuerySelectorAll.call(this, selector);
    return getAllMatches(owner, matches);
}

function lightDomQuerySelectorValue(this: HTMLElement, selector: string): Element | null {
    const owner = getNodeOwner(this);
    if (isNull(owner)) {
        return null;
    }
    const nodeList = nativeQuerySelectorAll.call(this, selector);
    return getFirstMatch(owner, nodeList);
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

export function getFilteredChildNodes(node: Node): Element[] {
    let children;
    if (!isUndefined(getNodeKey(node))) {
        // node itself is a custom element
        // lwc element, in which case we need to get only the nodes
        // that were slotted
        const slots = nativeQuerySelectorAll.call(node, 'slot');
        children = ArrayReduce.call(slots, (seed, slot) => {
            if (isNodeOwnedBy(node as HTMLElement, slot)) {
                ArrayPush.apply(seed, ArraySlice.call(nativeChildNodesGetter.call(slot)));
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
        assert.logWarning(`childNodes on ${toString(this)} returns a live NodeList which is not stable. Use querySelectorAll instead.`);
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
    if (isNull(parentNode) || parentNode.tagName !== 'SLOT' || getNodeOwnerKey(parentNode) === getNodeOwnerKey(this)) {
        return null;
    }
    return patchShadowDomTraversalMethods(parentNode as HTMLElement);
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

export const ElementPatchDescriptors: PropertyDescriptorMap = assign(NodePatchDescriptors, {
    querySelector: {
        value: lightDomQuerySelectorValue,
        configurable: true,
        enumerable: true,
    },
    querySelectorAll: {
        value: lightDomQuerySelectorAllValue,
        configurable: true,
        enumerable: true,
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
    if (isFalse(nodeIsPatched(node as Node))) {
        if ((node as any).tagName === 'IFRAME') {
            // We need to patch iframe.contentWindow because raw access to the contentWindow
            // Will break in compat mode
            defineProperty(node, 'contentWindow', contentWindowDescriptor);
        }
    }
    return patchDomNode(node);
}
