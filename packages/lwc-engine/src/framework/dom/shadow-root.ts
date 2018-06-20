import assert from "../assert";
import { isNull, create, hasOwnProperty, isFalse, ArrayIndexOf, assign, isUndefined } from "../language";
import { getShadowRootVM } from "../vm";
import { addShadowRootEventListener, removeShadowRootEventListener } from "./events";
import { shadowRootQuerySelector, shadowRootQuerySelectorAll, shadowRootChildNodes, getPatchedCustomElement } from "./traverse";
import { createShadowRootAOMDescriptorMap } from './aom';
import { usesNativeSymbols } from "../utils";
import { getInnerHTML } from "../../3rdparty/polymer/inner-html";
import { getTextContent } from "../../3rdparty/polymer/text-content";
import { compareDocumentPosition, DOCUMENT_POSITION_CONTAINS } from "./node";

let ArtificialShadowRootPrototype;

export const ShadowRootKey = usesNativeSymbols && process.env.NODE_ENV !== 'test' ? Symbol('ShadowRoot') : '$$ShadowRoot$$';

export function attachShadow(elm: HTMLElement, options: ShadowRootInit): ShadowRoot {
    if (hasOwnProperty.call(elm, ShadowRootKey)) {
        throw new Error(`Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`);
    }
    const { mode } = options;
    if (isUndefined(ArtificialShadowRootPrototype)) {
        // Adding AOM properties to the faux shadow root prototype
        // Note: lazy creation to avoid circular deps
        ArtificialShadowRootPrototype = create(null, assign(ArtificialShadowRootDescriptors, createShadowRootAOMDescriptorMap()));
    }
    return create(ArtificialShadowRootPrototype, {
        mode: {
            get() { return mode; },
            enumerable: true,
            configurable: true,
        },
    }) as ShadowRoot;
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
    return childNodes[childNodes.length] || null;
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

const ArtificialShadowRootDescriptors: PropertyDescriptorMap = {
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
            const vm = getShadowRootVM(this);
            const node = shadowRootQuerySelector(this, selector);
            if (process.env.NODE_ENV !== 'production') {
                if (isNull(node) && isFalse(vm.isRoot)) {
                    // note: we don't show errors for root elements since their light dom is always empty in fallback mode
                    if (getPatchedCustomElement(vm.elm).querySelector(selector)) {
                        assert.logWarning(`this.template.querySelector() can only return elements from the template declaration of ${vm}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelector() instead.`);
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
            const vm = getShadowRootVM(this);
            const nodeList = shadowRootQuerySelectorAll(this, selector);
            if (process.env.NODE_ENV !== 'production') {
                if (nodeList.length === 0 && isFalse(vm.isRoot)) {
                    // note: we don't show errors for root elements since their light dom is always empty in fallback mode
                    if (getPatchedCustomElement(vm.elm).querySelector(selector)) {
                        assert.logWarning(`this.template.querySelectorAll() can only return elements from template declaration of ${vm}. It seems that you are looking for elements that were passed via slots, in which case you should use this.querySelectorAll() instead.`);
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
            if (this === otherNode) {
                // it is the root itself
                return 0;
            }
            if (this.contains(otherNode)) {
                // it belongs to the shadow root instance
                return 20; // 10100 === DOCUMENT_POSITION_FOLLOWING & DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            } else if (compareDocumentPosition.call(this, otherNode) & DOCUMENT_POSITION_CONTAINS) {
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
            return ArrayIndexOf.call(this.querySelectorAll('*'), otherNode) !== -1;
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
