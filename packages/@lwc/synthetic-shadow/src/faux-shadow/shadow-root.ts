/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayFilter,
    assign,
    create,
    defineProperty,
    isNull,
    isTrue,
    isUndefined,
    KEY__SHADOW_RESOLVER,
    KEY__SHADOW_RESOLVER_PRIVATE,
    KEY__NATIVE_GET_ELEMENT_BY_ID,
    KEY__NATIVE_QUERY_SELECTOR_ALL,
    setPrototypeOf,
    getPrototypeOf,
    isObject,
} from '@lwc/shared';

import { innerHTMLSetter } from '../env/element';
import { dispatchEvent } from '../env/event-target';
import { DocumentPrototypeActiveElement, getElementById, querySelectorAll } from '../env/document';
import { isInstanceOfNativeShadowRoot } from '../env/shadow-root';
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
    COMMENT_NODE,
    Node,
} from '../env/node';

import { getOuterHTML } from '../3rdparty/polymer/outer-html';
import { getTextContent } from '../3rdparty/polymer/text-content';

import { getOwnerDocument } from '../shared/utils';
import { createStaticNodeList } from '../shared/static-node-list';
import { setNodeKey, setNodeOwnerKey } from '../shared/node-ownership';
import { fauxElementFromPoint } from '../shared/faux-element-from-point';
import { fauxElementsFromPoint } from '../shared/faux-elements-from-point';
import { createStaticHTMLCollection } from '../shared/static-html-collection';

import { getInternalChildNodes } from './node';
import { addShadowRootEventListener, removeShadowRootEventListener } from './events';
import {
    shadowRootQuerySelector,
    shadowRootQuerySelectorAll,
    shadowRootChildNodes,
    isNodeOwnedBy,
    isSlotElement,
} from './traverse';

const InternalSlot = new WeakMap<any, ShadowRootRecord>();
const { createDocumentFragment } = document;

interface ShadowRootRecord {
    mode: 'open' | 'closed';
    delegatesFocus: boolean;
    host: Element;
    shadowRoot: ShadowRoot;
}

export function hasInternalSlot(root: unknown): boolean {
    return InternalSlot.has(root);
}

function getInternalSlot(root: ShadowRoot | Element): ShadowRootRecord {
    const record = InternalSlot.get(root);
    if (isUndefined(record)) {
        throw new TypeError();
    }
    return record;
}

defineProperty(Node.prototype, KEY__SHADOW_RESOLVER, {
    set(this: Node, fn: ShadowRootResolver | undefined) {
        if (isUndefined(fn)) return;
        (this as any)[KEY__SHADOW_RESOLVER_PRIVATE] = fn;
        // TODO [#1164]: temporary propagation of the key
        setNodeOwnerKey(this, (fn as any).nodeKey);
    },
    get(this: Node): ShadowRootResolver | undefined {
        return (this as any)[KEY__SHADOW_RESOLVER_PRIVATE];
    },
    configurable: true,
    enumerable: true,
});

// The isUndefined check is because two copies of synthetic shadow may be loaded on the same page, and this
// would throw an error if we tried to redefine it. Plus the whole point is to expose the native method.
if (isUndefined((globalThis as any)[KEY__NATIVE_GET_ELEMENT_BY_ID])) {
    defineProperty(globalThis, KEY__NATIVE_GET_ELEMENT_BY_ID, {
        value: getElementById,
        configurable: true,
    });
}

// See note above.
if (isUndefined((globalThis as any)[KEY__NATIVE_QUERY_SELECTOR_ALL])) {
    defineProperty(globalThis, KEY__NATIVE_QUERY_SELECTOR_ALL, {
        value: querySelectorAll,
        configurable: true,
    });
}

// Function created per shadowRoot instance, it returns the shadowRoot, and is attached
// into every new element inserted into the shadow via the GetShadowRootFnKey
// property value.
export type ShadowRootResolver = () => ShadowRoot;

export function getShadowRootResolver(node: Node): undefined | ShadowRootResolver {
    return (node as any)[KEY__SHADOW_RESOLVER];
}

export function setShadowRootResolver(node: Node, fn: ShadowRootResolver | undefined) {
    (node as any)[KEY__SHADOW_RESOLVER] = fn;
}

export function isDelegatingFocus(host: HTMLElement): boolean {
    return getInternalSlot(host).delegatesFocus;
}

export function getHost(root: ShadowRoot): Element {
    return getInternalSlot(root).host;
}

export function getShadowRoot(elm: Element): ShadowRoot {
    return getInternalSlot(elm).shadowRoot;
}

// Intentionally adding `Node` here in addition to `Element` since this check is harmless for nodes
// and we can avoid having to cast the type before calling this method in a few places.
export function isSyntheticShadowHost(node: unknown): node is HTMLElement {
    const shadowRootRecord = InternalSlot.get(node);
    return !isUndefined(shadowRootRecord) && node === shadowRootRecord.host;
}

export function isSyntheticShadowRoot(node: unknown): node is ShadowRoot {
    const shadowRootRecord = InternalSlot.get(node);
    return !isUndefined(shadowRootRecord) && node === shadowRootRecord.shadowRoot;
}

let uid = 0;

export function attachShadow(elm: Element, options: ShadowRootInit): ShadowRoot {
    if (InternalSlot.has(elm)) {
        throw new Error(
            `Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.`
        );
    }
    const { mode, delegatesFocus } = options;
    // creating a real fragment for shadowRoot instance
    const doc = getOwnerDocument(elm);
    const sr = createDocumentFragment.call(doc) as ShadowRoot;
    // creating shadow internal record
    const record: ShadowRootRecord = {
        mode,
        delegatesFocus: !!delegatesFocus,
        host: elm,
        shadowRoot: sr,
    };
    InternalSlot.set(sr, record);
    InternalSlot.set(elm, record);
    const shadowResolver = () => sr;
    const x = (shadowResolver.nodeKey = uid++);
    setNodeKey(elm, x);
    setShadowRootResolver(sr, shadowResolver);
    // correcting the proto chain
    setPrototypeOf(sr, SyntheticShadowRoot.prototype);
    return sr;
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
    synthetic: {
        writable: false,
        enumerable: false,
        configurable: false,
        value: true,
    },
};

const ShadowRootDescriptors = {
    activeElement: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot): Element | null {
            const host = getHost(this);
            const doc = getOwnerDocument(host);
            const activeElement = DocumentPrototypeActiveElement.call(doc);
            if (isNull(activeElement)) {
                return activeElement;
            }

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
                // parentElement is always an element because we are talking up the tree knowing
                // that it is a child of the host.
                node = parentElementGetter.call(node)!;
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
        get(this: ShadowRoot): boolean {
            return getInternalSlot(this).delegatesFocus;
        },
    },
    elementFromPoint: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, left: number, top: number) {
            const host = getHost(this);
            const doc = getOwnerDocument(host);
            return fauxElementFromPoint(this, doc, left, top);
        },
    },
    elementsFromPoint: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, left: number, top: number): Element[] {
            const host = getHost(this);
            const doc = getOwnerDocument(host);
            return fauxElementsFromPoint(this, doc, left, top);
        },
    },
    getSelection: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot): Selection | null {
            throw new Error('Disallowed method "getSelection" on ShadowRoot.');
        },
    },
    host: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot): Element {
            return getHost(this);
        },
    },
    mode: {
        configurable: true,
        get(this: ShadowRoot) {
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

export const eventToShadowRootMap = new WeakMap<Event, ShadowRoot>();

const NodePatchDescriptors = {
    insertBefore: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: ShadowRoot, newChild: T, refChild: Node | null): T {
            insertBefore.call(getHost(this), newChild, refChild);
            return newChild;
        },
    },
    removeChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: ShadowRoot, oldChild: T): T {
            removeChild.call(getHost(this), oldChild);
            return oldChild;
        },
    },
    appendChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: ShadowRoot, newChild: T): T {
            appendChild.call(getHost(this), newChild);
            return newChild;
        },
    },
    replaceChild: {
        writable: true,
        enumerable: true,
        configurable: true,
        value<T extends Node>(this: ShadowRoot, newChild: Node, oldChild: T): T {
            replaceChild.call(getHost(this), newChild, oldChild);
            return oldChild;
        },
    },
    addEventListener: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(
            this: ShadowRoot,
            type: string,
            listener: EventListener,
            options?: boolean | AddEventListenerOptions
        ) {
            addShadowRootEventListener(this, type, listener, options);
        },
    },
    dispatchEvent: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, evt: Event): boolean {
            eventToShadowRootMap.set(evt, this);
            // Typescript does not like it when you treat the `arguments` object as an array
            // @ts-ignore type-mismatch
            return dispatchEvent.apply(getHost(this), arguments);
        },
    },
    removeEventListener: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(
            this: ShadowRoot,
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
        get(this: ShadowRoot) {
            return getHost(this).baseURI;
        },
    },
    childNodes: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot): NodeListOf<Node & Element> {
            return createStaticNodeList(shadowRootChildNodes(this));
        },
    },
    cloneNode: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot): Selection | null {
            throw new Error('Disallowed method "cloneNode" on ShadowRoot.');
        },
    },
    compareDocumentPosition: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, otherNode: Node): number {
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
        value(this: ShadowRoot, otherNode: Node) {
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
        get(this: ShadowRoot): ChildNode | null {
            const childNodes = getInternalChildNodes(this);
            return childNodes[0] || null;
        },
    },
    lastChild: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot): ChildNode | null {
            const childNodes = getInternalChildNodes(this);
            return childNodes[childNodes.length - 1] || null;
        },
    },
    hasChildNodes: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot): boolean {
            const childNodes = getInternalChildNodes(this);
            return childNodes.length > 0;
        },
    },
    isConnected: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot) {
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
        get(this: ShadowRoot): Document | null {
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
        get(this: ShadowRoot): string {
            const childNodes = getInternalChildNodes(this);
            let textContent = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                const currentNode = childNodes[i];

                if (currentNode.nodeType !== COMMENT_NODE) {
                    textContent += getTextContent(currentNode);
                }
            }
            return textContent;
        },
        set(this: ShadowRoot, v: string) {
            const host = getHost(this);
            textContextSetter.call(host, v);
        },
    },
    // Since the synthetic shadow root is a detached DocumentFragment, short-circuit the getRootNode behavior
    getRootNode: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, options?: GetRootNodeOptions): Node {
            return !isUndefined(options) && isTrue(options.composed)
                ? getHost(this).getRootNode(options)
                : this;
        },
    },
};

const ElementPatchDescriptors = {
    innerHTML: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot): string {
            const childNodes = getInternalChildNodes(this);
            let innerHTML = '';
            for (let i = 0, len = childNodes.length; i < len; i += 1) {
                innerHTML += getOuterHTML(childNodes[i]);
            }
            return innerHTML;
        },
        set(this: ShadowRoot, v: string) {
            const host = getHost(this);
            innerHTMLSetter.call(host, v);
        },
    },
};

const ParentNodePatchDescriptors = {
    childElementCount: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot): number {
            return this.children.length;
        },
    },
    children: {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot) {
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
    getElementById: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot): Selection | null {
            throw new Error('Disallowed method "getElementById" on ShadowRoot.');
        },
    },
    querySelector: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, selectors: string): Element | null {
            return shadowRootQuerySelector(this, selectors);
        },
    },
    querySelectorAll: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, selectors: string): NodeListOf<Element> {
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

// `this.shadowRoot instanceof ShadowRoot` should evaluate to true even for synthetic shadow
defineProperty(SyntheticShadowRoot, Symbol.hasInstance, {
    value: function (object: any): boolean {
        // Technically we should walk up the entire prototype chain, but with SyntheticShadowRoot
        // it's reasonable to assume that no one is doing any deep subclasses here.
        return (
            isObject(object) &&
            !isNull(object) &&
            (isInstanceOfNativeShadowRoot(object) ||
                getPrototypeOf(object) === SyntheticShadowRoot.prototype)
        );
    },
});
