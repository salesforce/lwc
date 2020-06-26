/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { assert, hasOwnProperty, isUndefined, create } from '@lwc/shared';
import { getAttrNameFromPropName, Renderer } from '@lwc/engine-core';

const globalStylesheets: { [content: string]: true } = create(null);
const globalStylesheetsParentElement: Element = document.head || document.body || document;

// TODO [#0]: Evaluate how we can extract the `$shadowToken$` property name in a shared package
// to avoid having to synchronize it between the different modules.
export const useSyntheticShadow = hasOwnProperty.call(Element.prototype, '$shadowToken$');

export const renderer: Renderer<Node, Element> = {
    ssr: false,
    syntheticShadow: useSyntheticShadow,

    createElement(tagName: string, namespace: string): Element {
        return isUndefined(namespace)
            ? document.createElement(tagName)
            : document.createElementNS(namespace, tagName);
    },

    createText(content: string): Node {
        return document.createTextNode(content);
    },

    insert(node: Node, parent: Node, anchor: Node): void {
        parent.insertBefore(node, anchor);
    },

    remove(node: Node, parent: Node): void {
        parent.removeChild(node);
    },

    nextSibling(node: Node): Node | null {
        return node.nextSibling;
    },

    attachShadow(element: Element, options: ShadowRootInit): ShadowRoot {
        return element.attachShadow(options);
    },

    setText(node: Node, content: string): void {
        node.nodeValue = content;
    },

    getProperty(node: Node, key: string): any {
        return (node as any)[key];
    },

    setProperty(node: Node, key: string, value: any): void {
        if (process.env.NODE_ENV !== 'production') {
            if (node instanceof Element && !(key in node)) {
                // TODO [#1297]: Move this validation to the compiler
                assert.fail(
                    `Unknown public property "${key}" of element <${
                        node.tagName
                    }>. This is likely a typo on the corresponding attribute "${getAttrNameFromPropName(
                        key
                    )}".`
                );
            }
        }

        (node as any)[key] = value;
    },

    getAttribute(element: Element, name: string, namespace?: string): string | null {
        return isUndefined(namespace)
            ? element.getAttribute(name)
            : element.getAttributeNS(namespace, name);
    },

    setAttribute(element: Element, name: string, value: string, namespace?: string): void {
        return isUndefined(namespace)
            ? element.setAttribute(name, value)
            : element.setAttributeNS(namespace, name, value);
    },

    removeAttribute(element: Element, name: string, namespace?: string): void {
        if (isUndefined(namespace)) {
            element.removeAttribute(name);
        } else {
            element.removeAttributeNS(namespace, name);
        }
    },

    addEventListener(
        target: Node,
        type: string,
        callback: EventListener,
        options: AddEventListenerOptions | boolean
    ): void {
        target.addEventListener(type, callback, options);
    },

    removeEventListener(
        target: Node,
        type: string,
        callback: EventListener,
        options: EventListenerOptions | boolean
    ): void {
        target.removeEventListener(type, callback, options);
    },

    dispatchEvent(target: Node, event: Event): boolean {
        return target.dispatchEvent(event);
    },

    getClassList(element: Element): DOMTokenList {
        return element.classList;
    },

    getStyleDeclaration(element: Element): CSSStyleDeclaration {
        // TODO [#0]: How to avoid this type casting? Shall we use a different type interface to
        // represent elements in the engine?
        return (element as HTMLElement | SVGElement).style;
    },

    getBoundingClientRect(element: Element): DOMRect {
        return element.getBoundingClientRect();
    },

    querySelector(element: Element, selectors: string): Element | null {
        return element.querySelector(selectors);
    },

    querySelectorAll(element: Element, selectors: string): NodeList {
        return element.querySelectorAll(selectors);
    },

    getElementsByTagName(element: Element, tagNameOrWildCard: string): HTMLCollection {
        return element.getElementsByTagName(tagNameOrWildCard);
    },

    getElementsByClassName(element: Element, names: string): HTMLCollection {
        return element.getElementsByClassName(names);
    },

    isConnected(node: Node): boolean {
        return node.isConnected;
    },

    insertGlobalStylesheet(content: string): void {
        if (!isUndefined(globalStylesheets[content])) {
            return;
        }

        globalStylesheets[content] = true;

        const elm = document.createElement('style');
        elm.type = 'text/css';
        elm.textContent = content;

        globalStylesheetsParentElement.appendChild(elm);
    },

    assertInstanceOfHTMLElement(elm: any, msg: string) {
        assert.invariant(elm instanceof HTMLElement, msg);
    },
};
