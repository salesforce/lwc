import assert from "../shared/assert";
import { assign, create, isNull, setPrototypeOf, defineProperty, ArrayFilter } from "../shared/language";
import { addShadowRootEventListener, removeShadowRootEventListener } from "./events";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll, shadowRootChildNodes, isNodeOwnedBy, isSlotElement, getRootNodeGetter, GetRootNodeOptions } from "./traverse";
import { getInternalField, setInternalField, createFieldName } from "../shared/fields";
import { getTextContent } from "../3rdparty/polymer/text-content";
import { createStaticNodeList } from "../shared/static-node-list";
import { DocumentPrototypeActiveElement, elementFromPoint } from "../env/document";
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY, parentElementGetter } from "../env/node";
import { isNativeShadowRootAvailable } from "../env/dom";
import { createStaticHTMLCollection } from "../shared/static-html-collection";
import { getOuterHTML } from "../3rdparty/polymer/outer-html";
import { retarget } from "../3rdparty/polymer/retarget";
import { pathComposer } from "../3rdparty/polymer/path-composer";

const HostKey = createFieldName('host');
const ShadowRootKey = createFieldName('shadowRoot');
const { createDocumentFragment } = document;

export function isDelegatingFocus(host: HTMLElement): boolean {
    const shadowRoot = getShadowRoot(host);
    return shadowRoot.delegatesFocus;
}

export function getHost(root: SyntheticShadowRootInterface): HTMLElement {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(root[HostKey], `A 'ShadowRoot' node must be attached to an 'HTMLElement' node.`);
    }
    return root[HostKey];
}

export function getShadowRoot(elm: HTMLElement): SyntheticShadowRootInterface {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(getInternalField(elm, ShadowRootKey), `A Custom Element with a shadow attached must be provided as the first argument.`);
    }
    return getInternalField(elm, ShadowRootKey);
}

export function attachShadow(elm: HTMLElement, options: ShadowRootInit): SyntheticShadowRootInterface {
    if (getInternalField(elm, ShadowRootKey)) {
        throw new Error(`Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`);
    }
    const { mode, delegatesFocus } = options;
    // creating a real fragment for shadowRoot instance
    const sr = createDocumentFragment.call(document);
    defineProperty(sr, 'mode', {
        get() { return mode; },
        configurable: true,
        enumerable: true,
    });
    defineProperty(sr, 'delegatesFocus', {
        get() { return !!delegatesFocus; },
        configurable: true,
        enumerable: true,
    });
    // correcting the proto chain
    setPrototypeOf(sr, SyntheticShadowRoot.prototype);
    setInternalField(sr, HostKey, elm);
    setInternalField(elm, ShadowRootKey, sr);
    // expose the shadow via a hidden symbol for testing purposes
    if (process.env.NODE_ENV === 'test') {
        elm['$$ShadowRoot$$'] = sr; // tslint:disable-line
    }
    return sr;
}

export enum ShadowRootMode {
    CLOSED = "closed",
    OPEN = "open",
}

export interface SyntheticShadowRootInterface extends ShadowRoot {
    mode: ShadowRootMode;
    delegatesFocus: boolean;
}

const SyntheticShadowRootDescriptors = {
    constructor: {
        writable: true,
        enumerable: false,
        configurable: true,
        value: SyntheticShadowRoot,
    },
};
const ShadowRootDescriptors = {
    mode: {
        writable: true,
        enumerable: false,
        configurable: true,
        value() {
            return ShadowRootMode.OPEN;
        },
    },
    host: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface) {
            return getHost(this);
        }
    },
//    delegatesFocus: boolean = false;
//    toString() {
//        return `[object ShadowRoot]`;
//    }
//    get innerHTML(this: SyntheticShadowRootInterface): string {
//        const { childNodes } = this;
//        let innerHTML = '';
//        for (let i = 0, len = childNodes.length; i < len; i += 1) {
//            innerHTML += getOuterHTML(childNodes[i]);
//        }
//        return innerHTML;
//    }
//    get activeElement(this: SyntheticShadowRootInterface): Element | null {
//        const activeElement = DocumentPrototypeActiveElement.call(document);
//        if (isNull(activeElement)) {
//            return activeElement;
//        }
//        const host = getHost(this);
//
//        if ((compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) === 0) {
//            return null;
//        }
//
//        // activeElement must be child of the host and owned by it
//        let node = activeElement;
//        while (!isNodeOwnedBy(host, node)) {
//            node = parentElementGetter.call(node);
//        }
//
//        // If we have a slot element here
//        // That means that we were dealing with an element that was passed to one of our slots
//        // In this case, activeElement returns null
//        if (isSlotElement(node)) {
//            return null;
//        }
//        return node;
//    }
//    // Same functionality as document.elementFromPoint
//    // but we should only return elements that the shadow owns,
//    // or are ancestors of the shadow
//    elementFromPoint(this: SyntheticShadowRootInterface, left: number, top: number): Element | null {
//        const element = elementFromPoint.call(document, left, top);
//        if (isNull(element)) {
//            return element;
//        }
//        return retarget(this, pathComposer(element, true)) as (Element | null);
//    }
//
//    elementsFromPoint(this: SyntheticShadowRootInterface, left: number, top: number): Element[] {
//        // TODO: implement
//        throw new Error();
//    }
//
//    getSelection(this: SyntheticShadowRootInterface): Selection | null {
//        throw new Error();
//    }
//    // TODO: remove this after upgrading TS 3.x (issue #748)
//    stylesheets: StyleSheetList;
//    get styleSheets(): StyleSheetList {
//        // TODO: implement
//        throw new Error();
//    }
};

const NodePatchDescriptors = {
    nodeType: {
        enumerable: true,
        configurable: true,
        value() {
            return 11; // Node.DOCUMENT_FRAGMENT_NODE
        },
    },
    nodeName: {
        enumerable: true,
        configurable: true,
        value() {
            return '#document-fragment';
        },
    },
    nodeValue: {
        enumerable: true,
        configurable: true,
        value() {
            return null;
        },
    },
//    compareDocumentPosition(this: SyntheticShadowRootInterface, otherNode: Node | SyntheticShadowRootInterface) {
//        const host = getHost(this);
//        if (this === otherNode) {
//            // it is the root itself
//            return 0;
//        }
//        if (this.contains(otherNode as Node)) {
//            // it belongs to the shadow root instance
//            return 20; // 10100 === DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
//        } else if (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) {
//            // it is a child element but does not belong to the shadow root instance
//            return 37; // 100101 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
//        } else {
//            // it is not a descendant
//            return 35; // 100011 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_PRECEDING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
//        }
//    }
//    contains(this: SyntheticShadowRootInterface, otherNode: Node) {
//        const host = getHost(this);
//        // must be child of the host and owned by it.
//        return (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 &&
//            isNodeOwnedBy(host, otherNode);
//    }
//    hasChildNodes(this: SyntheticShadowRootInterface, ) {
//        return this.childNodes.length > 0;
//    }
//    get namespaceURI() {
//        return null;
//    }
//    get nextSibling() {
//        return null;
//    }
//    get previousSibling() {
//        return null;
//    }
//    get ownerDocument(this: SyntheticShadowRootInterface) {
//        return getHost(this).ownerDocument;
//    }
//    get localName() {
//        return null;
//    }
//    get prefix() {
//        return;
//    }
//    get baseURI(this: SyntheticShadowRootInterface) {
//        return getHost(this).baseURI;
//    }
//    get isConnected(this: SyntheticShadowRootInterface) {
//        return (compareDocumentPosition.call(document, getHost(this)) & DOCUMENT_POSITION_CONTAINED_BY) !== 0;
//    }
//    get firstChild(this: SyntheticShadowRootInterface): ChildNode | null {
//        const { childNodes } = this;
//        return childNodes[0] || null;
//    }
//    get lastChild(this: SyntheticShadowRootInterface): ChildNode | null {
//        const { childNodes } = this;
//        return childNodes[childNodes.length - 1] || null;
//    }
//    get childNodes(this: SyntheticShadowRootInterface): NodeListOf<Node & Element> {
//        return createStaticNodeList(shadowRootChildNodes(this));
//    }
//    get parentNode() {
//        return null;
//    }
//    get parentElement() {
//        return null;
//    }
//    get textContent(this: SyntheticShadowRootInterface): string {
//        const { childNodes } = this;
//        let textContent = '';
//        for (let i = 0, len = childNodes.length; i < len; i += 1) {
//            textContent += getTextContent(childNodes[i]);
//        }
//        return textContent;
//    }
//    getRootNode(this: SyntheticShadowRootInterface, options?: GetRootNodeOptions): Node {
//        return getRootNodeGetter.call(this, options);
//    }
//    addEventListener(this: SyntheticShadowRootInterface, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
//        addShadowRootEventListener(this, type, listener, options);
//    }
//    removeEventListener(this: SyntheticShadowRootInterface, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
//        removeShadowRootEventListener(this, type, listener, options);
//    }
};

// TODO: Why are we adding descriptors from Element?
const ElementPatchDescriptors = {
//    get nextElementSibling() {
//        return null;
//    }
//    get previousElementSibling() {
//        return null;
//    }
};

const ParentNodePatchDescriptors = {
    childElementCount: {
        enumerable: true,
        configurable: true,
        get(this: HTMLElement) {
            return this.children.length;
        }
    },
    children: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface) {
            return createStaticHTMLCollection(
                ArrayFilter.call(shadowRootChildNodes(this), (elm: Node | Element) => elm instanceof Element)
            );
        }
    },
    firstElementChild: {
        enumerable: true,
        configurable: true,
        get(this: Element) {
            return this.children[0] || null;
        }
    },
    lastElementChild: {
        enumerable: true,
        configurable: true,
        get(this: Element) {
            const { children } = this;
            return children.item(children.length - 1) || null;
        }
    },
    querySelector: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface, selectors: string): Element | null {
            return shadowRootQuerySelector(this, selectors);
        },
    },
    querySelectorAll: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface, selectors: string): NodeListOf<Element> {
            return createStaticNodeList(shadowRootQuerySelectorAll(this, selectors));
        },
    },
};

assign(
    SyntheticShadowRootDescriptors,
    ShadowRootDescriptors,
    ParentNodePatchDescriptors,
    NodePatchDescriptors,
    ElementPatchDescriptors,
);

function SyntheticShadowRoot() {
    throw new TypeError('Illegal constructor');
}
SyntheticShadowRoot.prototype = create(DocumentFragment.prototype, SyntheticShadowRootDescriptors);

// Is native ShadowDom is available on window,
// we need to make sure that our synthetic shadow dom
// passed instanceof checks against window.ShadowDom
if (isNativeShadowRootAvailable) {
    setPrototypeOf(SyntheticShadowRoot.prototype, (window as any).ShadowRoot.prototype);
}
