/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assign,
    create,
    isNull,
    setPrototypeOf,
    ArrayFilter,
    defineProperties,
    isUndefined,
    isFalse,
} from '../shared/language';
import { addShadowRootEventListener, removeShadowRootEventListener } from './events';
import {
    shadowRootQuerySelector,
    shadowRootQuerySelectorAll,
    shadowRootChildNodes,
    isNodeOwnedBy,
    isSlotElement,
    patchedGetRootNode,
} from './traverse';
import { getInternalField, setInternalField, createFieldName } from '../shared/fields';
import { getTextContent } from '../3rdparty/polymer/text-content';
import { createStaticNodeList } from '../shared/static-node-list';
import { DocumentPrototypeActiveElement, elementFromPoint, createComment } from '../env/document';
import {
    compareDocumentPosition,
    DOCUMENT_POSITION_CONTAINED_BY,
    parentElementGetter,
    textContextSetter,
    isConnected,
    removeChild,
    insertBefore,
    replaceChild,
    appendChild,
} from '../env/node';
import { isNativeShadowRootAvailable } from '../env/dom';
import { createStaticHTMLCollection } from '../shared/static-html-collection';
import { getOuterHTML } from '../3rdparty/polymer/outer-html';
import { retarget } from '../3rdparty/polymer/retarget';
import { pathComposer } from '../3rdparty/polymer/path-composer';
import { getInternalChildNodes } from './node';
import { innerHTMLSetter } from '../env/element';

const InternalSlot = createFieldName('shadowRecord');
const { createDocumentFragment } = document;

interface ShadowRootRecord {
    mode: 'open' | 'closed';
    delegatesFocus: boolean;
    host: HTMLElement;
    shadowRoot: SyntheticShadowRootInterface;
}

function getInternalSlot(root: SyntheticShadowRootInterface | HTMLElement): ShadowRootRecord {
    const record: ShadowRootRecord | undefined = getInternalField(root, InternalSlot);
    if (isUndefined(record)) {
        throw new TypeError();
    }
    return record;
}

export function isDelegatingFocus(host: HTMLElement): boolean {
    return getInternalSlot(host).delegatesFocus;
}

export function getHost(root: SyntheticShadowRootInterface): HTMLElement {
    return getInternalSlot(root).host;
}

export function getShadowRoot(elm: HTMLElement): SyntheticShadowRootInterface {
    return getInternalSlot(elm).shadowRoot;
}

export function attachShadow(
    elm: HTMLElement,
    options: ShadowRootInit
): SyntheticShadowRootInterface {
    if (!isUndefined(getInternalField(elm, InternalSlot))) {
        throw new Error(
            `Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`
        );
    }
    const { mode, delegatesFocus } = options;
    // creating a real fragment for shadowRoot instance
    const sr = createDocumentFragment.call(document) as SyntheticShadowRootInterface;
    // creating shadow internal record
    const record: ShadowRootRecord = {
        mode,
        delegatesFocus: !!delegatesFocus,
        host: elm,
        shadowRoot: sr,
    };
    setInternalField(sr, InternalSlot, record);
    setInternalField(elm, InternalSlot, record);
    // correcting the proto chain
    setPrototypeOf(sr, SyntheticShadowRoot.prototype);
    return sr;
}

export interface SyntheticShadowRootInterface extends ShadowRoot {
    // TODO: TS doesn't support delegatesFocus just yet
    delegatesFocus: boolean;
}

const SyntheticShadowRootDescriptors = {
    constructor: {
        writable: true,
        configurable: true,
        value: SyntheticShadowRoot,
    },
    toString: {
        writable: true,
        configurable: true,
        value() {
            return `[object ShadowRoot]`;
        },
    },
};

const ShadowRootDescriptors = {
    activeElement: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): Element | null {
            const activeElement = DocumentPrototypeActiveElement.call(document);
            if (isNull(activeElement)) {
                return activeElement;
            }

            const host = getHost(this);
            if (
                (compareDocumentPosition.call(host, activeElement) &
                    DOCUMENT_POSITION_CONTAINED_BY) ===
                0
            ) {
                return null;
            }

            // activeElement must be child of the host and owned by it
            let node = activeElement;
            while (!isNodeOwnedBy(host, node)) {
                node = parentElementGetter.call(node) as HTMLElement;
            }

            // If we have a slot element here that means that we were dealing
            // with an element that was passed to one of our slots. In this
            // case, activeElement returns null.
            if (isSlotElement(node)) {
                return null;
            }

            return node;
        },
    },
    delegatesFocus: {
        configurable: true,
        get(this: SyntheticShadowRootInterface): boolean {
            return getInternalSlot(this).delegatesFocus;
        },
    },
    elementFromPoint: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface, left: number, top: number) {
            const element = elementFromPoint.call(document, left, top);
            if (isNull(element)) {
                return element;
            }
            return retarget(this, pathComposer(element, true)) as Element | null;
        },
    },
    elementsFromPoint: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface, _left: number, _top: number): Element[] {
            throw new Error();
        },
    },
    getSelection: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface): Selection | null {
            throw new Error();
        },
    },
    host: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): Element {
            return getHost(this);
        },
    },
    mode: {
        configurable: true,
        get(this: SyntheticShadowRootInterface) {
            return getInternalSlot(this).mode;
        },
    },
    styleSheets: {
        enumerable: true,
        configurable: true,
        get(): StyleSheetList {
            throw new Error();
        },
    },
};

const NodePatchDescriptors = {
    insertBefore: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(
            this: SyntheticShadowRootInterface,
            newChild: T,
            refChild: Node | null
        ): T {
            insertBefore.call(getHost(this), newChild, refChild);
            return newChild;
        },
    },
    removeChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: SyntheticShadowRootInterface, oldChild: T): T {
            removeChild.call(getHost(this), oldChild);
            return oldChild;
        },
    },
    appendChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: SyntheticShadowRootInterface, newChild: T): T {
            appendChild.call(getHost(this), newChild);
            return newChild;
        },
    },
    replaceChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: SyntheticShadowRootInterface, newChild: Node, oldChild: T): T {
            replaceChild.call(getHost(this), newChild, oldChild);
            return oldChild;
        },
    },
    addEventListener: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(
            this: SyntheticShadowRootInterface,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            addShadowRootEventListener(this, type, listener, options);
        },
    },
    removeEventListener: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(
            this: SyntheticShadowRootInterface,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            removeShadowRootEventListener(this, type, listener, options);
        },
    },
    baseURI: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface) {
            return getHost(this).baseURI;
        },
    },
    childNodes: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): NodeListOf<Node & Element> {
            return createStaticNodeList(shadowRootChildNodes(this));
        },
    },
    compareDocumentPosition: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(
            this: SyntheticShadowRootInterface,
            otherNode: Node | SyntheticShadowRootInterface
        ): number {
            const host = getHost(this);

            if (this === otherNode) {
                // "this" and "otherNode" are the same shadow root.
                return 0;
            } else if (this.contains(otherNode as Node)) {
                // "otherNode" belongs to the shadow tree where "this" is the shadow root.
                return 20; // Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING
            } else if (
                compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY
            ) {
                // "otherNode" is in a different shadow tree contained by the shadow tree where "this" is the shadow root.
                return 37; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            } else {
                // "otherNode" is in a different shadow tree that is not contained by the shadow tree where "this" is the shadow root.
                return 35; // Node.DOCUMENT_POSITION_DISCONNECTED | Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
            }
        },
    },
    contains: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface, otherNode: Node) {
            if (this === otherNode) {
                return true;
            }
            const host = getHost(this);
            // must be child of the host and owned by it.
            return (
                (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !==
                    0 && isNodeOwnedBy(host, otherNode)
            );
        },
    },
    firstChild: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): ChildNode | null {
            const childNodes = getInternalChildNodes(this);
            return childNodes[0] || null;
        },
    },
    lastChild: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): ChildNode | null {
            const childNodes = getInternalChildNodes(this);
            return childNodes[childNodes.length - 1] || null;
        },
    },
    hasChildNodes: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface): boolean {
            const childNodes = getInternalChildNodes(this);
            return childNodes.length > 0;
        },
    },
    isConnected: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface) {
            return isConnected.call(getHost(this));
        },
    },
    nextSibling: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    previousSibling: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    nodeName: {
        enumerable: true,
        configurable: true,
        get() {
            return '#document-fragment';
        },
    },
    nodeType: {
        enumerable: true,
        configurable: true,
        get() {
            return 11; // Node.DOCUMENT_FRAGMENT_NODE
        },
    },
    nodeValue: {
        enumerable: true,
        configurable: true,
        get() {
            return null;
        },
    },
    ownerDocument: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): Document | null {
            return getHost(this).ownerDocument;
        },
    },
    parentElement: {
        enumerable: true,
        configurable: true,
        get(): Element | null {
            return null;
        },
    },
    parentNode: {
        enumerable: true,
        configurable: true,
        get(): Node | null {
            return null;
        },
    },
    textContent: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): string {
            const childNodes = getInternalChildNodes(this);
            let textContent = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                textContent += getTextContent(childNodes[i]);
            }
            return textContent;
        },
        set(this: SyntheticShadowRootInterface, v: string) {
            const host = getHost(this);
            textContextSetter.call(host, v);
        },
    },
    // Since the synthetic shadow root is a detached DocumentFragment, short-circuit the getRootNode behavior
    getRootNode: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: SyntheticShadowRootInterface, options?: GetRootNodeOptions): Node {
            const composed: boolean = isUndefined(options) ? false : !!options.composed;
            return isFalse(composed) ? this : patchedGetRootNode.call(getHost(this), { composed });
        },
    },
};

const ElementPatchDescriptors = {
    innerHTML: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface): string {
            const childNodes = getInternalChildNodes(this);
            let innerHTML = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                innerHTML += getOuterHTML(childNodes[i]);
            }
            return innerHTML;
        },
        set(this: SyntheticShadowRootInterface, v: string) {
            const host = getHost(this);
            innerHTMLSetter.call(host, v);
        },
    },
};

const ParentNodePatchDescriptors = {
    childElementCount: {
        enumerable: true,
        configurable: true,
        get(this: HTMLElement): number {
            return this.children.length;
        },
    },
    children: {
        enumerable: true,
        configurable: true,
        get(this: SyntheticShadowRootInterface) {
            return createStaticHTMLCollection(
                ArrayFilter.call(
                    shadowRootChildNodes(this),
                    (elm: Node | Element) => elm instanceof Element
                )
            );
        },
    },
    firstElementChild: {
        enumerable: true,
        configurable: true,
        get(this: Element): Element | null {
            return this.children[0] || null;
        },
    },
    lastElementChild: {
        enumerable: true,
        configurable: true,
        get(this: Element): Element | null {
            const { children } = this;
            return children.item(children.length - 1) || null;
        },
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
    NodePatchDescriptors,
    ParentNodePatchDescriptors,
    ElementPatchDescriptors,
    ShadowRootDescriptors
);

export function SyntheticShadowRoot() {
    throw new TypeError('Illegal constructor');
}
SyntheticShadowRoot.prototype = create(DocumentFragment.prototype, SyntheticShadowRootDescriptors);

// Is native ShadowDom is available on window,
// we need to make sure that our synthetic shadow dom
// passed instanceof checks against window.ShadowDom
if (isNativeShadowRootAvailable) {
    setPrototypeOf(SyntheticShadowRoot.prototype, (window as any).ShadowRoot.prototype);
}

/**
 * This method is only intended to be used in non-production mode in IE11
 * and its role is to produce a 1-1 mapping between a shadowRoot instance
 * and a comment node that is intended to use to trick the IE11 DevTools
 * to show the content of the shadowRoot in the DOM Explorer.
 */
export function getIE11FakeShadowRootPlaceholder(host: HTMLElement): Comment {
    const shadowRoot = getShadowRoot(host);
    // @ts-ignore this $$placeholder$$ is not a security issue because you must
    // have access to the shadowRoot in order to extract the fake node, which give
    // you access to the same childNodes of the shadowRoot, so, who cares.
    let c = shadowRoot.$$placeholder$$;
    if (!isUndefined(c)) {
        return c;
    }
    // @ts-ignore $$placeholder$$ is fine, read the node above.
    c = shadowRoot.$$placeholder$$ = createComment.call(document, '');
    defineProperties(c, {
        childNodes: {
            get() {
                return shadowRoot.childNodes;
            },
            enumerable: true,
            configurable: true,
        },
        tagName: {
            get() {
                return `#shadow-root (${shadowRoot.mode})`;
            },
            enumerable: true,
            configurable: true,
        },
    });
    return c;
}
