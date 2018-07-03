import assert from "../assert";
import { isNull, create, assign, isUndefined, toString, getOwnPropertyDescriptor, ArrayReduce, } from "../language";
import { getNodeKey } from "../vm";
import { addShadowRootEventListener, removeShadowRootEventListener } from "./events";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll, shadowRootChildNodes, getPatchedCustomElement, isNodeOwnedBy } from "./traverse";
import { getInternalField, setInternalField, createSymbol } from "../utils";
import { getInnerHTML } from "../../3rdparty/polymer/inner-html";
import { getTextContent } from "../../3rdparty/polymer/text-content";
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINED_BY } from "./node";
import { ElementAOMPropertyNames } from "../attributes";
import { unwrap } from "./traverse-membrane";

let ArtificialShadowRootPrototype;

const HostKey = createSymbol('host');
const ShadowRootKey = createSymbol('shadowRoot');
const isNativeShadowRootAvailable = typeof (window as any).ShadowRoot !== "undefined";

export function getHost(root: ShadowRoot): HTMLElement {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(root[HostKey], `A 'ShadowRoot' node must be attached to an 'HTMLElement' node.`);
    }
    return root[HostKey];
}

export function getShadowRoot(elm: HTMLElement): ShadowRoot {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(getInternalField(elm, ShadowRootKey), `A Custom Element with a shadow attached must be provided as the first argument.`);
    }
    return getInternalField(elm, ShadowRootKey);
}

// Synthetic creation of all AOM property descriptors for Shadow Roots
function createShadowRootAOMDescriptorMap(): PropertyDescriptorMap {
    return ArrayReduce.call(ElementAOMPropertyNames, (seed: PropertyDescriptorMap, propName: string) => {
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

export function attachShadow(elm: HTMLElement, options: ShadowRootInit): ShadowRoot {
    if (getInternalField(elm, ShadowRootKey)) {
        throw new Error(`Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`);
    }
    const { mode } = options;
    if (isUndefined(ArtificialShadowRootPrototype)) {
        // Adding AOM properties to the faux shadow root prototype
        // Note: lazy creation to avoid circular deps
        assign(ArtificialShadowRootDescriptors, createShadowRootAOMDescriptorMap());
        ArtificialShadowRootPrototype = create(null, ArtificialShadowRootDescriptors);
    }
    const sr = create(ArtificialShadowRootPrototype, {
        mode: {
            get() { return mode; },
            enumerable: true,
            configurable: true,
        },
    }) as ShadowRoot;
    setInternalField(sr, HostKey, elm);
    setInternalField(elm, ShadowRootKey, sr);
    // expose the shadow via a hidden symbol for testing purposes
    if (process.env.NODE_ENV === 'test') {
        elm['$$ShadowRoot$$'] = sr; // tslint:disable-line
    }
    return sr;
}

function patchedShadowRootChildNodesGetter(this: ShadowRoot): Element[] {
    return shadowRootChildNodes(this);
}

function patchedShadowRootFirstChildGetter(this: ShadowRoot): Node | null {
    const { childNodes } = this;
    return childNodes[0] || null;
}

function patchedShadowRootLastChildGetter(this: ShadowRoot): Node | null {
    const { childNodes } = this;
    return childNodes[childNodes.length - 1] || null;
}

function patchedShadowRootInnerHTMLGetter(this: ShadowRoot): string {
    const { childNodes } = this;
    let innerHTML = '';
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        innerHTML += getInnerHTML(childNodes[i]);
    }
    return innerHTML;
}

function patchedShadowRootTextContentGetter(this: ShadowRoot): string {
    const { childNodes } = this;
    let textContent = '';
    for (let i = 0, len = childNodes.length; i < len; i += 1) {
        textContent += getTextContent(childNodes[i]);
    }
    return textContent;
}

function hostGetter(this: ShadowRoot): HTMLElement {
    return getHost(this);
}

const ArtificialShadowRootDescriptors: PropertyDescriptorMap = {
    host: {
        get: hostGetter,
        enumerable: true,
        configurable: true,
    },
    firstChild: {
        get: patchedShadowRootFirstChildGetter,
        enumerable: true,
        configurable: true,
    },
    lastChild: {
        get: patchedShadowRootLastChildGetter,
        enumerable: true,
        configurable: true,
    },
    innerHTML: {
        get: patchedShadowRootInnerHTMLGetter,
        enumerable: true,
        configurable: true,
    },
    textContent: {
        get: patchedShadowRootTextContentGetter,
        enumerable: true,
        configurable: true,
    },
    childNodes: {
        get: patchedShadowRootChildNodesGetter,
        enumerable: true,
        configurable: true,
    },
    delegatesFocus: {
        value: false,
        enumerable: true,
        configurable: true,
    },
    hasChildNodes: {
        value(this: ShadowRoot): boolean {
            return this.childNodes.length > 0;
        },
        enumerable: true,
        configurable: true,
    },
    querySelector: {
        value(this: ShadowRoot, selector: string): Element | null {
            const node = shadowRootQuerySelector(this, selector);
            if (process.env.NODE_ENV !== 'production') {
                const host = getHost(this);
                const isRoot = isUndefined(getNodeKey(host));
                if (isNull(node) && !isRoot) {
                    // note: we don't show errors for root elements since their light dom is always empty in fallback mode
                    if (getPatchedCustomElement(host).querySelector(selector)) {
                        assert.logWarning(`this.template.querySelector() can only return elements from the template declaration of ${toString(host)}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
                    }
                }
            }
            return node as Element;
        },
        enumerable: true,
        configurable: true,
    },
    querySelectorAll: {
        value(this: ShadowRoot, selector: string): Element[] {
            const nodeList = shadowRootQuerySelectorAll(this, selector);
            if (process.env.NODE_ENV !== 'production') {
                const host = getHost(this);
                const isRoot = isUndefined(getNodeKey(host));
                if (nodeList.length === 0 && !isRoot) {
                    // note: we don't show errors for root elements since their light dom is always empty in fallback mode
                    if (getPatchedCustomElement(host).querySelector(selector)) {
                        assert.logWarning(`this.template.querySelectorAll() can only return elements from template declaration of ${toString(host)}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
                    }
                }
            }
            return nodeList;
        },
        enumerable: true,
        configurable: true,
    },
    addEventListener: {
        value(this: ShadowRoot, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
            addShadowRootEventListener(this, type, listener, options);
        },
        enumerable: true,
        configurable: true,
    },
    removeEventListener: {
        value(this: ShadowRoot, type: string, listener: EventListener, options?: boolean | AddEventListenerOptions) {
            removeShadowRootEventListener(this, type, listener, options);
        },
        enumerable: true,
        configurable: true,
    },
    compareDocumentPosition: {
        value(this: ShadowRoot, otherNode: Node): number {
            // this API might be called with proxies
            otherNode = unwrap(otherNode);
            const host = getHost(this);
            if (this === otherNode) {
                // it is the root itself
                return 0;
            }
            if (this.contains(otherNode)) {
                // it belongs to the shadow root instance
                return 20; // 10100 === DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            } else if (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) {
                // it is a child element but does not belong to the shadow root instance
                return 37; // 100101 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            } else {
                // it is not a descendant
                return 35; // 100011 === DOCUMENT_POSITION_DISCONNECTED & DOCUMENT_POSITION_PRECEDING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            }
        },
        enumerable: true,
        configurable: true,
    },
    contains: {
        value(this: ShadowRoot, otherNode: Node): boolean {
            // this API might be called with proxies
            otherNode = unwrap(otherNode);
            const host = getHost(this);
            // must be child of the host and owned by it.
            return (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 &&
                isNodeOwnedBy(host, otherNode);
        },
        enumerable: true,
        configurable: true,
    },
    toString: {
        value() {
            return `[object ShadowRoot]`;
        },
    },
};
