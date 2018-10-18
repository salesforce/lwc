import assert from "../shared/assert";
import { isFalse, create, isUndefined, getOwnPropertyDescriptor, ArrayReduce, isNull, defineProperties, setPrototypeOf, defineProperty } from "../shared/language";
import { addShadowRootEventListener, removeShadowRootEventListener } from "./events";
import { shadowDomElementFromPoint, shadowRootQuerySelector, shadowRootQuerySelectorAll, shadowRootChildNodes, isNodeOwnedBy, isSlotElement } from "./traverse";
import { getInternalField, setInternalField, createFieldName } from "../shared/fields";
import { getInnerHTML } from "../3rdparty/polymer/inner-html";
import { getTextContent } from "../3rdparty/polymer/text-content";
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY, parentElementGetter } from "./node";
// it is ok to import from the polyfill since they always go hand-to-hand anyways.
import { ElementPrototypeAriaPropertyNames } from "../polyfills/aria-properties/polyfill";
import { DocumentPrototypeActiveElement } from "./document";

const HostKey = createFieldName('host');
const ShadowRootKey = createFieldName('shadowRoot');
const isNativeShadowRootAvailable = typeof (window as any).ShadowRoot !== "undefined";
const { createDocumentFragment } = document;

export function getHost(root: SyntheticShadowRoot): HTMLElement {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(root[HostKey], `A 'ShadowRoot' node must be attached to an 'HTMLElement' node.`);
    }
    return root[HostKey];
}

export function getShadowRoot(elm: HTMLElement): SyntheticShadowRoot {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(getInternalField(elm, ShadowRootKey), `A Custom Element with a shadow attached must be provided as the first argument.`);
    }
    return getInternalField(elm, ShadowRootKey);
}

// Synthetic creation of all AOM property descriptors for Shadow Roots
function createShadowRootAOMDescriptorMap(): PropertyDescriptorMap {
    return ArrayReduce.call(ElementPrototypeAriaPropertyNames, (seed: PropertyDescriptorMap, propName: string) => {
        let descriptor: PropertyDescriptor | undefined;
        if (isNativeShadowRootAvailable) {
            descriptor = getOwnPropertyDescriptor((window as any).ShadowRoot.prototype, propName);
        } else {
            descriptor = getOwnPropertyDescriptor(Element.prototype, propName);
        }
        if (!isUndefined(descriptor)) {
            seed[propName] = descriptor;
        }
        return seed;
    }, create(null));
}

let ShadowRootPrototypePatched = false;
export function attachShadow(elm: HTMLElement, options: ShadowRootInit): SyntheticShadowRoot {
    if (getInternalField(elm, ShadowRootKey)) {
        throw new Error(`Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`);
    }
    const { mode } = options;

    // These cannot be patched when module is loaded because
    // Element.prototype needs to be patched first, which happens
    // after this module is executed
    if (isFalse(ShadowRootPrototypePatched)) {
        ShadowRootPrototypePatched = true;
        defineProperties(SyntheticShadowRoot.prototype, createShadowRootAOMDescriptorMap());
    }
    // creating a real fragment for shadowRoot instance
    const sr = createDocumentFragment.call(document);
    defineProperty(sr, 'mode', {
        value: mode,
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

function patchedShadowRootChildNodesGetter(this: SyntheticShadowRoot): Element[] {
    return shadowRootChildNodes(this);
}

function patchedShadowRootFirstChildGetter(this: SyntheticShadowRoot): Node | null {
    const { childNodes } = this;
    return childNodes[0] || null;
}

function patchedShadowRootLastChildGetter(this: SyntheticShadowRoot): Node | null {
    const { childNodes } = this;
    return childNodes[childNodes.length - 1] || null;
}

function patchedShadowRootInnerHTMLGetter(this: SyntheticShadowRoot): string {
    const { childNodes } = this;
    let innerHTML = '';
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        innerHTML += getInnerHTML(childNodes[i]);
    }
    return innerHTML;
}

function patchedShadowRootTextContentGetter(this: SyntheticShadowRoot): string {
    const { childNodes } = this;
    let textContent = '';
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        textContent += getTextContent(childNodes[i]);
    }
    return textContent;
}

function activeElementGetter(this: SyntheticShadowRoot): Element | null {
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

export enum ShadowRootMode {
    CLOSED = "closed",
    OPEN = "open",
}

export class SyntheticShadowRoot extends DocumentFragment implements ShadowRoot {
    mode: ShadowRootMode;
    constructor() {
        super();
        throw new TypeError('Illegal constructor');
    }
    get nodeType() {
        return 11;
    }
    get host() {
        return getHost(this);
    }
    get activeElement() {
        return activeElementGetter.call(this);
    }
    get firstChild() {
        return patchedShadowRootFirstChildGetter.call(this);
    }
    get lastChild() {
        return patchedShadowRootLastChildGetter.call(this);
    }
    get innerHTML() {
        return patchedShadowRootInnerHTMLGetter.call(this);
    }
    get textContent() {
        return patchedShadowRootTextContentGetter.call(this);
    }
    get childNodes() {
        return patchedShadowRootChildNodesGetter.call(this);
    }
    get delegatesFocus() {
        return false;
    }
    get parentNode() {
        return null;
    }
    get styleSheets(): StyleSheetList {
        // TODO: implement
        throw new Error();
    }
    hasChildNodes() {
        return this.childNodes.length > 0;
    }

    /**
     * Returns the first element that is a descendant of node that
     * matches selectors.
     */
    // querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
    // querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
    querySelector<E extends Element = Element>(selectors: string): E | null {
        return shadowRootQuerySelector(this, selectors);
    }
    /**
     * Returns all element descendants of node that
     * match selectors.
     */
    // querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>,
    // querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>,
    querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E> {
        return shadowRootQuerySelectorAll(this, selectors);
    }
    addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        addShadowRootEventListener(this, type, listener, options);
    }
    removeEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        removeShadowRootEventListener(this, type, listener, options);
    }
    compareDocumentPosition(otherNode: Node | SyntheticShadowRoot) {
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
    contains(otherNode: Node) {
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
    elementFromPoint(left: number, top: number): Element | null {
        return shadowDomElementFromPoint(getHost(this), left, top);
    }

    elementsFromPoint(left: number, top: number): Element[] {
        // TODO: implement
        throw new Error();
    }

    getSelection(): Selection | null {
        throw new Error();
    }
}

// Is native ShadowDom is available on window,
// we need to make sure that our synthetic shadow dom
// passed instanceof checks against window.ShadowDom
if (isNativeShadowRootAvailable) {
    setPrototypeOf(SyntheticShadowRoot.prototype, (window as any).ShadowRoot.prototype);
}
