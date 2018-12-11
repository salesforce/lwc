import assert from "../shared/assert";
import { isNull, setPrototypeOf, defineProperty, ArrayFilter } from "../shared/language";
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

const GlobalDocumentFragmentConstructor = DocumentFragment;
export class SyntheticShadowRoot extends GlobalDocumentFragmentConstructor implements ShadowRoot {
    mode: ShadowRootMode = ShadowRootMode.OPEN;
    delegatesFocus: boolean = false;
    constructor() {
        super();
        throw new TypeError('Illegal constructor');
    }
    get nodeType() {
        return 11; // Node.DOCUMENT_FRAGMENT_NODE
    }
    get nodeName() {
        return '#document-fragment';
    }
    get nodeValue() {
        return null;
    }
    get namespaceURI() {
        return null;
    }
    get nextSibling() {
        return null;
    }
    get previousSibling() {
        return null;
    }
    get nextElementSibling() {
        return null;
    }
    get previousElementSibling() {
        return null;
    }
    get localName() {
        return null;
    }
    get prefix() {
        return;
    }
    get ownerDocument(this: SyntheticShadowRootInterface) {
        return getHost(this).ownerDocument;
    }
    get baseURI(this: SyntheticShadowRootInterface) {
        return getHost(this).baseURI;
    }
    get isConnected(this: SyntheticShadowRootInterface) {
        return (compareDocumentPosition.call(document, getHost(this)) & DOCUMENT_POSITION_CONTAINED_BY) !== 0;
    }
    get host(this: SyntheticShadowRootInterface) {
        return getHost(this);
    }
    get activeElement(this: SyntheticShadowRootInterface): Element | null {
        const activeElement = DocumentPrototypeActiveElement.call(document);
        if (isNull(activeElement)) {
            return activeElement;
        }
        const host = getHost(this);

        if ((compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) === 0) {
            return null;
        }

        // activeElement must be child of the host and owned by it
        let node = activeElement;
        while (!isNodeOwnedBy(host, node)) {
            node = parentElementGetter.call(node);
        }

        // If we have a slot element here
        // That means that we were dealing with an element that was passed to one of our slots
        // In this case, activeElement returns null
        if (isSlotElement(node)) {
            return null;
        }
        return node;
    }
    get firstChild(this: SyntheticShadowRootInterface): ChildNode | null {
        const { childNodes } = this;
        return childNodes[0] || null;
    }
    get lastChild(this: SyntheticShadowRootInterface): ChildNode | null {
        const { childNodes } = this;
        return childNodes[childNodes.length - 1] || null;
    }
    get innerHTML(this: SyntheticShadowRootInterface): string {
        const { childNodes } = this;
        let innerHTML = '';
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            innerHTML += getOuterHTML(childNodes[i]);
        }
        return innerHTML;
    }
    get textContent(this: SyntheticShadowRootInterface): string {
        const { childNodes } = this;
        let textContent = '';
        for (let i = 0, len = childNodes.length; i < len; i += 1) {
            textContent += getTextContent(childNodes[i]);
        }
        return textContent;
    }
    get children(this: SyntheticShadowRootInterface): HTMLCollectionOf<Element> {
        return createStaticHTMLCollection(ArrayFilter.call(shadowRootChildNodes(this), (elm: Node | Element) => elm instanceof Element));
    }
    // ParentNode.prototype
    get childElementCount(this: HTMLElement) {
        return this.children.length;
    }
    get firstElementChild(this: Element) {
        return this.children[0] || null;
    }
    get lastElementChild(this: Element) {
        const { children } = this;
        return children.item(children.length - 1) || null;
    }
    get childNodes(this: SyntheticShadowRootInterface): NodeListOf<Node & Element> {
        return createStaticNodeList(shadowRootChildNodes(this));
    }
    get parentNode() {
        return null;
    }
    get parentElement() {
        return null;
    }
    // TODO: remove this after upgrading TS 3.x (issue #748)
    stylesheets: StyleSheetList;
    get styleSheets(): StyleSheetList {
        // TODO: implement
        throw new Error();
    }
    hasChildNodes(this: SyntheticShadowRootInterface, ) {
        return this.childNodes.length > 0;
    }

    /**
     * Returns the first element that is a descendant of node that
     * matches selectors.
     */
    querySelector(this: SyntheticShadowRootInterface, selectors: string): Element | null {
        return shadowRootQuerySelector(this, selectors);
    }
    /**
     * Returns all element descendants of node that
     * match selectors.
     */
    // querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>,
    // querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>,
    querySelectorAll(this: SyntheticShadowRootInterface, selectors: string): NodeListOf<Element> {
        return createStaticNodeList(shadowRootQuerySelectorAll(this, selectors));
    }
    addEventListener(this: SyntheticShadowRootInterface, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        addShadowRootEventListener(this, type, listener, options);
    }
    removeEventListener(this: SyntheticShadowRootInterface, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        removeShadowRootEventListener(this, type, listener, options);
    }
    compareDocumentPosition(this: SyntheticShadowRootInterface, otherNode: Node | SyntheticShadowRootInterface) {
        const host = getHost(this);
        if (this === otherNode) {
            // it is the root itself
            return 0;
        }
        if (this.contains(otherNode as Node)) {
            // it belongs to the shadow root instance
            return 20; // 10100 === DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        } else if (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) {
            // it is a child element but does not belong to the shadow root instance
            return 37; // 100101 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        } else {
            // it is not a descendant
            return 35; // 100011 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_PRECEDING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        }
    }
    contains(this: SyntheticShadowRootInterface, otherNode: Node) {
        const host = getHost(this);
        // must be child of the host and owned by it.
        return (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 &&
            isNodeOwnedBy(host, otherNode);
    }
    toString() {
        return `[object ShadowRoot]`;
    }

    // Same functionality as document.elementFromPoint
    // but we should only return elements that the shadow owns,
    // or are ancestors of the shadow
    elementFromPoint(this: SyntheticShadowRootInterface, left: number, top: number): Element | null {
        const element = elementFromPoint.call(document, left, top);
        if (isNull(element)) {
            return element;
        }
        return retarget(this, pathComposer(element, true)) as (Element | null);
    }

    elementsFromPoint(this: SyntheticShadowRootInterface, left: number, top: number): Element[] {
        // TODO: implement
        throw new Error();
    }

    getSelection(this: SyntheticShadowRootInterface): Selection | null {
        throw new Error();
    }

    getRootNode(this: SyntheticShadowRootInterface, options?: GetRootNodeOptions): Node {
        return getRootNodeGetter.call(this, options);
    }
}

// Is native ShadowDom is available on window,
// we need to make sure that our synthetic shadow dom
// passed instanceof checks against window.ShadowDom
if (isNativeShadowRootAvailable) {
    setPrototypeOf(SyntheticShadowRoot.prototype, (window as any).ShadowRoot.prototype);
}
