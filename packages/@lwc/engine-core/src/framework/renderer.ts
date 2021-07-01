/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export type HostNode = any;
export type HostElement = any;

export interface Renderer<N = HostNode, E = HostElement> {
    ssr: boolean;
    syntheticShadow: boolean;
    insert(node: N, parent: E, anchor: N | null): void;
    remove(node: N, parent: E): void;
    createElement(tagName: string, namespace?: string): E;
    createText(content: string): N;
    createComment(content: string): N;
    nextSibling(node: N): N | null;
    attachShadow(element: E, options: ShadowRootInit): N;
    getProperty(node: N, key: string): any;
    setProperty(node: N, key: string, value: any): void;
    setText(node: N, content: string): void;
    getAttribute(element: E, name: string, namespace?: string | null): string | null;
    setAttribute(element: E, name: string, value: string, namespace?: string | null): void;
    removeAttribute(element: E, name: string, namespace?: string | null): void;
    addEventListener(
        target: E,
        type: string,
        callback: (event: Event) => any,
        options?: AddEventListenerOptions | boolean
    ): void;
    removeEventListener(
        target: E,
        type: string,
        callback: (event: Event) => any,
        options?: EventListenerOptions | boolean
    ): void;
    dispatchEvent(target: N, event: Event): boolean;
    getClassList(element: E): DOMTokenList;
    setCSSStyleProperty(element: E, name: string, value: string): void;
    getBoundingClientRect(element: E): ClientRect;
    querySelector(element: E, selectors: string): E | null;
    querySelectorAll(element: E, selectors: string): NodeList;
    getElementsByTagName(element: E, tagNameOrWildCard: string): HTMLCollection;
    getElementsByClassName(element: E, names: string): HTMLCollection;
    isConnected(node: N): boolean;
    insertGlobalStylesheet(content: string): void;
    assertInstanceOfHTMLElement?(elm: any, msg: string): void;
    defineCustomElement(
        name: string,
        constructor: CustomElementConstructor,
        options?: ElementDefinitionOptions
    ): void;
    getCustomElement(name: string): CustomElementConstructor | undefined;
    HTMLElement: typeof HTMLElement;
}

// This is a temporary workaround to get the @lwc/engine-server to evaluate in node without having
// to inject at runtime.
export const HTMLElementConstructor: typeof HTMLElement =
    typeof HTMLElement !== 'undefined' ? HTMLElement : (function () {} as any);
export const HTMLElementPrototype = HTMLElementConstructor.prototype;
