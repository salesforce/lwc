/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { assert, isNull, isUndefined } from '@lwc/shared';

function cloneNode(node: Node, deep: boolean): Node {
    return node.cloneNode(deep);
}

function createElement(tagName: string, namespace?: string): Element {
    return isUndefined(namespace)
        ? document.createElement(tagName)
        : document.createElementNS(namespace, tagName);
}

function createText(content: string): Node {
    return document.createTextNode(content);
}

function createComment(content: string): Node {
    return document.createComment(content);
}

// Parse the fragment HTML string into DOM
function createFragment(html: string): Node | null {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

function insert(node: Node, parent: Node, anchor: Node): void {
    parent.insertBefore(node, anchor);
}

function remove(node: Node, parent: Node): void {
    parent.removeChild(node);
}

function nextSibling(node: Node): Node | null {
    return node.nextSibling;
}

function previousSibling(node: Node): Node | null {
    return node.previousSibling;
}

function attachShadow(element: Element, options: ShadowRootInit): ShadowRoot {
    // `shadowRoot` will be non-null in two cases:
    //   1. upon initial load with an SSR-generated DOM, while in Shadow render mode
    //   2. when a webapp author places <c-app> in their static HTML and mounts their
    //      root component with customElement.define('c-app', Ctor)
    if (!isNull(element.shadowRoot)) {
        return element.shadowRoot;
    }
    return element.attachShadow(options);
}

function setText(node: Node, content: string): void {
    node.nodeValue = content;
}

function getProperty(node: Node, key: string): any {
    return (node as any)[key];
}

function setProperty(node: Node, key: string, value: any): void {
    (node as any)[key] = value;
}

function getAttribute(element: Element, name: string, namespace?: string | null): string | null {
    return isUndefined(namespace)
        ? element.getAttribute(name)
        : element.getAttributeNS(namespace, name);
}

function setAttribute(
    element: Element,
    name: string,
    value: string,
    namespace?: string | null
): void {
    return isUndefined(namespace)
        ? element.setAttribute(name, value)
        : element.setAttributeNS(namespace, name, value);
}

function removeAttribute(element: Element, name: string, namespace?: string | null): void {
    if (isUndefined(namespace)) {
        element.removeAttribute(name);
    } else {
        element.removeAttributeNS(namespace, name);
    }
}

function addEventListener(
    target: Node,
    type: string,
    callback: EventListener,
    options?: AddEventListenerOptions | boolean
): void {
    target.addEventListener(type, callback, options);
}

function removeEventListener(
    target: Node,
    type: string,
    callback: EventListener,
    options?: EventListenerOptions | boolean
): void {
    target.removeEventListener(type, callback, options);
}

function dispatchEvent(target: Node, event: Event): boolean {
    return target.dispatchEvent(event);
}

function getClassList(element: Element): DOMTokenList {
    return element.classList;
}

function setCSSStyleProperty(
    element: Element,
    name: string,
    value: string,
    important: boolean
): void {
    // TODO [#0]: How to avoid this type casting? Shall we use a different type interface to
    // represent elements in the engine?
    (element as HTMLElement | SVGElement).style.setProperty(
        name,
        value,
        important ? 'important' : ''
    );
}

function getBoundingClientRect(element: Element): DOMRect {
    return element.getBoundingClientRect();
}

function querySelector(element: Element, selectors: string): Element | null {
    return element.querySelector(selectors);
}

function querySelectorAll(element: Element, selectors: string): NodeList {
    return element.querySelectorAll(selectors);
}

function getElementsByTagName(element: Element, tagNameOrWildCard: string): HTMLCollection {
    return element.getElementsByTagName(tagNameOrWildCard);
}

function getElementsByClassName(element: Element, names: string): HTMLCollection {
    return element.getElementsByClassName(names);
}

function getChildren(element: Element): HTMLCollection {
    return element.children;
}

function getChildNodes(element: Element): NodeList {
    return element.childNodes;
}

function getFirstChild(element: Element): Node | null {
    return element.firstChild;
}

function getFirstElementChild(element: Element): Element | null {
    return element.firstElementChild;
}

function getLastChild(element: Element): Node | null {
    return element.lastChild;
}

function getLastElementChild(element: Element): Element | null {
    return element.lastElementChild;
}

function isConnected(node: Node): boolean {
    return node.isConnected;
}

function assertInstanceOfHTMLElement(elm: any, msg: string) {
    assert.invariant(elm instanceof HTMLElement, msg);
}

function ownerDocument(element: Element): Document {
    return element.ownerDocument;
}

function getTagName(elm: Element): string {
    return elm.tagName;
}

function attachInternals(elm: HTMLElement): ElementInternals {
    return attachInternalsFunc.call(elm);
}

// Use the attachInternals method from HTMLElement.prototype because access to it is removed
// in HTMLBridgeElement, ie: elm.attachInternals is undefined.
// Additionally, cache the attachInternals method to protect against 3rd party monkey-patching.
const attachInternalsFunc =
    typeof ElementInternals !== 'undefined'
        ? HTMLElement.prototype.attachInternals
        : () => {
              throw new Error('attachInternals API is not supported in this browser environment.');
          };

export { registerContextConsumer, registerContextProvider } from './context';

export {
    insert,
    remove,
    cloneNode,
    createFragment,
    createElement,
    createText,
    createComment,
    nextSibling,
    previousSibling,
    attachShadow,
    getProperty,
    setProperty,
    setText,
    getAttribute,
    setAttribute,
    removeAttribute,
    addEventListener,
    removeEventListener,
    dispatchEvent,
    getClassList,
    setCSSStyleProperty,
    getBoundingClientRect,
    querySelector,
    querySelectorAll,
    getElementsByTagName,
    getElementsByClassName,
    getChildren,
    getChildNodes,
    getFirstChild,
    getFirstElementChild,
    getLastChild,
    getLastElementChild,
    getTagName,
    isConnected,
    assertInstanceOfHTMLElement,
    ownerDocument,
    attachInternals,
};
