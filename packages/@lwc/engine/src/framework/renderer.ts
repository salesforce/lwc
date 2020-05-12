/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export type HostNode = any;
export type HostElement = any;

export interface Renderer<Node = HostNode, Element = HostElement> {
    syntheticShadow: boolean;
    insert(node: Node, parent: Element, anchor: Node | null): void;
    remove(node: Node, parent: Element): void;
    createElement(tagName: string, namespace?: string): Element;
    createText(content: string): Node;
    nextSibling(node: Node): Node | null;
    attachShadow(
        element: Element,
        options: { mode: 'open' | 'closed'; delegatesFocus?: boolean; [key: string]: any }
    ): Node;
    setText(node: Node, content: string): void;
    getAttribute(element: Element, name: string, namespace?: string | null): string | null;
    setAttribute(element: Element, name: string, value: string, namespace?: string | null): void;
    removeAttribute(element: Element, name: string, namespace?: string | null): void;
    addEventListener(
        target: Element,
        type: string,
        callback: (event: Event) => any,
        options?: AddEventListenerOptions | boolean
    ): void;
    removeEventListener(
        target: Element,
        type: string,
        callback: (event: Event) => any,
        options?: AddEventListenerOptions | boolean
    ): void;
    dispatchEvent(target: Node, event: Event): boolean;
    getClassList(element: Element): DOMTokenList;
    getStyleDeclaration(element: Element): CSSStyleDeclaration;
    getBoundingClientRect(element: Element): ClientRect;
    querySelector(element: Element, selectors: string): Element | null;
    querySelectorAll(element: Element, selectors: string): NodeList;
    getElementsByTagName(element: Element, tagNameOrWildCard: string): HTMLCollection;
    getElementsByClassName(element: Element, names: string): HTMLCollection;
    isConnected(node: Node): boolean;
    tagName(element: Element): string;
}
