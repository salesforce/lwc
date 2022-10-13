/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export type HostNode = any;
export type HostElement = any;

type N = HostNode;
type E = HostElement;

export type LifecycleCallback = (elm: E) => void;

export interface RendererAPI {
    isNativeShadowDefined: boolean;
    isSyntheticShadowDefined: boolean;
    insert: (node: N, parent: E, anchor: N | null) => void;
    remove: (node: N, parent: E) => void;
    cloneNode: (node: N, deep: boolean) => N;
    createFragment: (html: string) => N | null;
    createElement: (tagName: string, namespace?: string) => E;
    createText: (content: string) => N;
    createComment: (content: string) => N;
    nextSibling: (node: N) => N | null;
    attachShadow: (element: E, options: ShadowRootInit) => N;
    getProperty: (node: N, key: string) => any;
    setProperty: (node: N, key: string, value: any) => void;
    setText: (node: N, content: string) => void;
    getAttribute: (element: E, name: string, namespace?: string | null) => string | null;
    setAttribute: (element: E, name: string, value: string, namespace?: string | null) => void;
    removeAttribute: (element: E, name: string, namespace?: string | null) => void;
    addEventListener: (
        target: N,
        type: string,
        callback: (event: Event) => any,
        options?: AddEventListenerOptions | boolean
    ) => void;
    removeEventListener: (
        target: N,
        type: string,
        callback: (event: Event) => any,
        options?: EventListenerOptions | boolean
    ) => void;
    dispatchEvent: (target: N, event: Event) => boolean;
    getClassList: (element: E) => DOMTokenList;
    setCSSStyleProperty: (element: E, name: string, value: string, important: boolean) => void;
    getBoundingClientRect: (element: E) => ClientRect;
    querySelector: (element: E, selectors: string) => E | null;
    querySelectorAll: (element: E, selectors: string) => NodeList;
    getElementsByTagName: (element: E, tagNameOrWildCard: string) => HTMLCollection;
    getElementsByClassName: (element: E, names: string) => HTMLCollection;
    getChildren: (element: E) => HTMLCollection;
    getChildNodes: (element: E) => NodeList;
    getFirstChild: (element: E) => N | null;
    getFirstElementChild: (element: E) => E | null;
    getLastChild: (element: E) => N | null;
    getLastElementChild: (element: E) => E | null;
    isConnected: (node: N) => boolean;
    insertStylesheet: (content: string, target?: ShadowRoot) => void;
    assertInstanceOfHTMLElement: (elm: any, msg: string) => void;
    createCustomElement: (
        tagName: string,
        upgradeCallback: LifecycleCallback,
        connectedCallback: LifecycleCallback,
        disconnectedCallback: LifecycleCallback
    ) => E;
}
