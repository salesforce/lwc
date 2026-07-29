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
    assert,
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

const getRootNodePatched = Node.prototype.getRootNode;
assert.isFalse(
    String(getRootNodePatched).includes('[native code]'),
    'Node prototype must be patched before patching shadow root.'
);

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

// Defined separately from others because it's used in `compareDocumentPosition`
function containsPatched(this: ShadowRoot, otherNode: Node): boolean {
    if (this === otherNode) {
        return true;
    }
    const host = getHost(this);
    // must be child of the host and owned by it.
    return (
        (compareDocumentPosition.call(host, otherNode) & DOCUMENT_POSITION_CONTAINED_BY) !== 0 &&
        isNodeOwnedBy(host, otherNode)
    );
}

/**
 * Some `ShadowRoot` methods have no correct shadow-scoped semantics, so synthetic shadow has
 * historically exposed them as stubs that throw when invoked: `getElementById`, `getSelection`,
 * and `cloneNode`. The problem is that a throwing stub is still a *callable function*, so
 * third-party code that feature-detects the method with a *value-based* check
 * (`typeof root.getElementById === 'function'`, `if (root.getElementById)`, or
 * `root.getElementById?.(id)`) sees it as present, commits to calling it, and only then hits the
 * throw.
 *
 * The motivating case is `getElementById`: native `ShadowRoot` inherits a *working* one from
 * `DocumentFragment`, so the exact same feature-detecting code succeeds in native but throws in
 * synthetic — a genuine native-vs-synthetic divergence. `getSelection` and `cloneNode` are swept in
 * so the three unsupported methods present a uniform surface, NOT because `undefined` matches
 * native for them: native `cloneNode` is present but *throws* `NotSupportedError` (cloning a shadow
 * root is forbidden by the DOM clone algorithm), and `getSelection` is non-standard (present in
 * Blink/WebKit, absent in Firefox, since the Selection API defines it only on `Document`/`Window`).
 * For those two, flag-on `undefined` is a deliberate, uniform choice rather than native parity.
 *
 * The `ENABLE_SHADOW_ROOT_UNDEFINED_METHODS` runtime flag lets an app opt into friendlier behavior:
 * when enabled, these methods are exposed as `undefined` instead of a throwing stub, so value-based
 * feature detection reveals their absence and callers can fall back to the supported, shadow-scoped
 * `querySelector('#' + id)` (only `getElementById` has such a fallback).
 *
 * `'methodName' in root` stays `true` even with the flag on — by design, not a gap. The own
 * accessor below is exactly what shadows the corresponding native `DocumentFragment.prototype`
 * method; deleting the property to make `in` report `false` would expose that native method, which
 * runs against the underlying (empty) fragment and silently returns `null` — a worse, silent-wrong
 * failure. The trade-off is that an `in`-guarded caller (`if ('x' in root) root.x()`) still enters
 * the branch and, flag-on, throws `TypeError: … is not a function` instead of the descriptive
 * `Disallowed method` error. Well-behaved detection uses value-based checks, which the flag fixes.
 *
 * This is a visible, behavioral change to an API that has shipped unchanged for years to every
 * synthetic-shadow consumer, so it is DEFAULT OFF: with the flag unset/false the throwing stub is
 * returned, preserving the legacy behavior — including write semantics (see the accessor's setter
 * below, which keeps `root.getElementById = fn` working exactly as the old `writable` data property
 * did). The one residual observable difference, regardless of flag state, is descriptor *kind*:
 * `getOwnPropertyDescriptor(prototype, methodName)` now reports an accessor (`get`/`set`) rather
 * than a data property (`value`/`writable`). That is intrinsic to reading the flag dynamically — a
 * data property would have to capture its `value` when the prototype is built, before the flag is
 * set — and it affects only tooling that introspects these three prototype descriptors to
 * distinguish data-vs-accessor, never normal invocation, reassignment, or feature detection.
 *
 * The flag is read dynamically through a getter (rather than captured when the prototype is built),
 * because runtime feature flags are set during app initialization — after this polyfill module is
 * imported.
 */
function createDisallowedMethodDescriptor(methodName: string): PropertyDescriptor {
    function disallowedMethod(this: ShadowRoot): never {
        throw new Error(`Disallowed method "${methodName}" on ShadowRoot.`);
    }
    return {
        enumerable: true,
        configurable: true,
        get(this: ShadowRoot): (() => never) | undefined {
            return lwcRuntimeFlags.ENABLE_SHADOW_ROOT_UNDEFINED_METHODS
                ? undefined
                : disallowedMethod;
        },
        // The pre-flag descriptor was a `writable: true` data property, so assigning the method
        // (`root.getElementById = fn`) created an own data property on the receiver. A getter-only
        // accessor would instead throw in strict mode (and silently drop the write in sloppy mode),
        // which is an observable change even with the flag off. This setter preserves the original
        // write semantics: it installs an own, writable data property on the receiver — matching
        // the byte-for-byte descriptor the inherited `writable` data property used to produce —
        // while the getter above keeps the flag read dynamic until such a reassignment occurs.
        set(this: ShadowRoot, value: unknown): void {
            defineProperty(this, methodName, {
                writable: true,
                enumerable: true,
                configurable: true,
                value,
            });
        },
    };
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
    // See createDisallowedMethodDescriptor: throws by default, `undefined` when the
    // ENABLE_SHADOW_ROOT_UNDEFINED_METHODS runtime flag is enabled.
    getSelection: createDisallowedMethodDescriptor('getSelection'),
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
            // @ts-expect-error type-mismatch
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
    // See createDisallowedMethodDescriptor: throws by default, `undefined` when the
    // ENABLE_SHADOW_ROOT_UNDEFINED_METHODS runtime flag is enabled.
    cloneNode: createDisallowedMethodDescriptor('cloneNode'),
    compareDocumentPosition: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(this: ShadowRoot, otherNode: Node): number {
            const host = getHost(this);

            if (this === otherNode) {
                // "this" and "otherNode" are the same shadow root.
                return 0;
            } else if (containsPatched.call(this, otherNode)) {
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
        value: containsPatched,
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
            return isTrue(options?.composed)
                ? getRootNodePatched.call(getHost(this), { composed: true })
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
    // See createDisallowedMethodDescriptor: throws by default, `undefined` when the
    // ENABLE_SHADOW_ROOT_UNDEFINED_METHODS runtime flag is enabled. This is the flag's original
    // motivating case: RUM/analytics libraries feature-detect `getElementById` on the shadow root.
    getElementById: createDisallowedMethodDescriptor('getElementById'),
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
