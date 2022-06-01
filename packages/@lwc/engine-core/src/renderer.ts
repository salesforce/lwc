import { VBaseElement } from './framework/vnodes';

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

let defaultRenderer: RendererAPI;

export function setDefaultRenderer(renderer: RendererAPI) {
    if (defaultRenderer !== undefined) {
        throw Error(`Invalid Renderer Initialization`);
    }
    defaultRenderer = renderer;
}

export function getRendererFromVNode(vnode: VBaseElement): RendererAPI {
    return vnode.data.renderer || defaultRenderer;
}

export interface RendererAPI {
    ssr: boolean;
    isNativeShadowDefined: boolean;
    isSyntheticShadowDefined: boolean;
    HTMLElementExported: typeof HTMLElement;
    isHydrating: () => boolean;
    insert: (node: N, parent: E, anchor: N | null) => void;
    remove: (node: N, parent: E) => void;
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
    defineCustomElement: (
        name: string,
        constructor: CustomElementConstructor,
        options?: ElementDefinitionOptions
    ) => void;
    getCustomElement: (name: string) => CustomElementConstructor | undefined;
}
