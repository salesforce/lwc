import assert from "../shared/assert";
import { isFalse, create, isUndefined, getOwnPropertyDescriptor, ArrayReduce, isNull, defineProperties } from "../shared/language";
import { addShadowRootEventListener, removeShadowRootEventListener } from "./events";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll, shadowRootChildNodes, isNodeOwnedBy } from "./traverse";
import { getInternalField, setInternalField, createFieldName } from "../shared/fields";
import { getInnerHTML } from "../3rdparty/polymer/inner-html";
import { getTextContent } from "../3rdparty/polymer/text-content";
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY, getNodeOwnerKey } from "./node";
// it is ok to import from the polyfill since they always go hand-to-hand anyways.
import { ElementPrototypeAriaPropertyNames } from "../polyfills/aria-properties/polyfill";
import { DocumentPrototypeActiveElement, elementsFromPoint } from "./document";
import { getNodeKey } from "../framework/vm";

const HostKey = createFieldName('host');
const ShadowRootKey = createFieldName('shadowRoot');
const isNativeShadowRootAvailable = !isUndefined((window as any).ShadowRoot) && (window as any).ShadowRoot.prototype instanceof DocumentFragment;

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
    const sr = new SyntheticShadowRoot(mode);
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
    // activeElement must be child of the host and owned by it
    // TODO: what happen with delegatesFocus is true for a child component?
    return (compareDocumentPosition.call(host, activeElement) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 &&
        isNodeOwnedBy(host, activeElement) ? activeElement : null;
}

function hostGetter(this: SyntheticShadowRoot): HTMLElement {
    return getHost(this);
}

export class SyntheticShadowRoot {
    mode: string;
    constructor(mode: string) {
        this.mode = mode;
    }
    get nodeType() {
        return 11;
    }
    get host() {
        return hostGetter.call(this);
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
    hasChildNodes() {
        return this.childNodes.length > 0;
    }
    querySelector(selector: string) {
        const node = shadowRootQuerySelector(this, selector);
        return node as Element;
    }
    querySelectorAll(selector: string) {
        const nodeList = shadowRootQuerySelectorAll(this, selector);
        return nodeList;
    }
    addEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        addShadowRootEventListener(this, type, listener, options);
    }
    removeEventListener(type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
        removeShadowRootEventListener(this, type, listener, options);
    }
    compareDocumentPosition(otherNode: Node | SyntheticShadowRoot) {
        // this API might be called with proxies
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
        // this API might be called with proxies
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
    elementFromPoint(left: number, top: number) {
        const elements = elementsFromPoint.call(document, left, top);
        const hostKey = getNodeKey(this.host);
        let topElement = null;
        for(let i = elements.length - 1; i >= 0; i -= 1) {
            const el = elements[i];
            const elementOwnerKey = getNodeOwnerKey(el);
            if (elementOwnerKey === hostKey) {
                topElement = el;
            } else if(topElement === null && isUndefined(elementOwnerKey)) {
                // This should handle any global elements that are ancestors
                // of our current shadow
                topElement = el;
            }
        }
        return topElement;
    }
}
