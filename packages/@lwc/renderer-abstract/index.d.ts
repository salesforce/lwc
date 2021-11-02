/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export declare type HostNode = any;
export declare type HostElement = any;

type N = HostNode;
type E = HostElement;

export declare const ssr: boolean;

export declare function setIsHydrating(value: boolean): void;
export declare function isHydrating(): boolean;

export declare const isNativeShadowDefined: boolean;
export declare const isSyntheticShadowDefined: boolean;

export declare function insert(node: N, parent: E, anchor: N | null): void;

export declare function remove(node: N, parent: E): void;

export declare function createElement(tagName: string, namespace?: string): E;

export declare function createText(content: string): N;

export declare function createComment(content: string): N;

export declare function nextSibling(node: N): N | null;

export declare function attachShadow(element: E, options: ShadowRootInit): N;

export declare function getProperty(node: N, key: string): any;

export declare function setProperty(node: N, key: string, value: any): void;

export declare function setText(node: N, content: string): void;

export declare function getAttribute(
    element: E,
    name: string,
    namespace?: string | null
): string | null;

export declare function setAttribute(
    element: E,
    name: string,
    value: string,
    namespace?: string | null
): void;

export declare function removeAttribute(element: E, name: string, namespace?: string | null): void;

export declare function addEventListener(
    target: N,
    type: string,
    callback: (event: Event) => any,
    options?: AddEventListenerOptions | boolean
): void;

export declare function removeEventListener(
    target: N,
    type: string,
    callback: (event: Event) => any,
    options?: EventListenerOptions | boolean
): void;

export declare function dispatchEvent(target: N, event: Event): boolean;

export declare function getClassList(element: E): DOMTokenList;

export declare function setCSSStyleProperty(
    element: E,
    name: string,
    value: string,
    important: boolean
): void;

export declare function getBoundingClientRect(element: E): ClientRect;

export declare function querySelector(element: E, selectors: string): E | null;

export declare function querySelectorAll(element: E, selectors: string): NodeList;

export declare function getElementsByTagName(element: E, tagNameOrWildCard: string): HTMLCollection;

export declare function getElementsByClassName(element: E, names: string): HTMLCollection;

export declare function getChildren(element: E): HTMLCollection;

export declare function getChildNodes(element: E): NodeList;

export declare function getFirstChild(element: E): N | null;

export declare function getFirstElementChild(element: E): E | null;

export declare function getLastChild(element: E): N | null;

export declare function getLastElementChild(element: E): E | null;

export declare function isConnected(node: N): boolean;

export declare function insertGlobalStylesheet(content: string): void;

export declare function insertStylesheet(content: string, target: N): void;

export declare function assertInstanceOfHTMLElement(elm: any, msg: string): void;

export declare function defineCustomElement(
    name: string,
    constructor: CustomElementConstructor,
    options?: ElementDefinitionOptions
): void;

export declare function getCustomElement(name: string): CustomElementConstructor | undefined;

declare const HTMLElementInner: typeof HTMLElement;
export { HTMLElementInner as HTMLElement };
