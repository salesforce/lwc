/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { assert, isNull, isUndefined } from '@lwc/shared';

let getCustomElement: any;
let defineCustomElement: any;
let HTMLElementConstructor;

function isCustomElementRegistryAvailable() {
    if (typeof customElements === 'undefined') {
        return false;
    }
    try {
        // dereference HTMLElement global because babel wraps globals in compat mode with a
        // _wrapNativeSuper()
        // This is a problem because LWCUpgradableElement extends renderer.HTMLElementExported which does not
        // get wrapped by babel.
        const HTMLElementAlias = HTMLElement;
        // In case we use compat mode with a modern browser, the compat mode transformation
        // invokes the DOM api with an .apply() or .call() to initialize any DOM api sub-classing,
        // which are not equipped to be initialized that way.
        class clazz extends HTMLElementAlias {}

        customElements.define('lwc-test-' + Math.floor(Math.random() * 1000000), clazz);
        new clazz();
        return true;
    } catch {
        return false;
    }
}

if (isCustomElementRegistryAvailable()) {
    getCustomElement = customElements.get.bind(customElements);
    defineCustomElement = customElements.define.bind(customElements);
    HTMLElementConstructor = HTMLElement;
} else {
    const registry: Record<string, CustomElementConstructor> = Object.create(null);
    const reverseRegistry: WeakMap<CustomElementConstructor, string> = new WeakMap();

    defineCustomElement = function define(name: string, ctor: CustomElementConstructor) {
        if (name !== String.prototype.toLowerCase.call(name) || registry[name]) {
            throw new TypeError(`Invalid Registration`);
        }
        registry[name] = ctor;
        reverseRegistry.set(ctor, name);
    };

    getCustomElement = function get(name: string): CustomElementConstructor | undefined {
        return registry[name];
    };

    HTMLElementConstructor = function HTMLElement(this: HTMLElement) {
        if (!(this instanceof HTMLElement)) {
            throw new TypeError(`Invalid Invocation`);
        }
        const { constructor } = this;
        const name = reverseRegistry.get(constructor as CustomElementConstructor);
        if (!name) {
            throw new TypeError(`Invalid Construction`);
        }
        const elm = document.createElement(name);
        Object.setPrototypeOf(elm, constructor.prototype);
        return elm;
    };
    HTMLElementConstructor.prototype = HTMLElement.prototype;
}

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

let createFragment: (html: string) => Node | null;
// IE11 lacks support for this feature
const SUPPORTS_TEMPLATE = typeof HTMLTemplateElement === 'function';
if (SUPPORTS_TEMPLATE) {
    // Parse the fragment HTML string into DOM
    createFragment = function (html: string) {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
    };
} else {
    // In browsers that don't support <template> (e.g. IE11), we need to be careful to wrap elements like
    // <td> in the proper container elements (e.g. <tbody>), because otherwise they will be parsed as null.

    // Via https://github.com/webcomponents/polyfills/blob/ee1db33/packages/template/template.js#L273-L280
    // With other elements added from:
    // https://github.com/sindresorhus/html-tags/blob/95dcdd5/index.js
    // Using the test:
    // document.createRange().createContextualFragment(`<${tag}></${tag}>`).firstChild === null
    // And omitting <html>, <head>, and <body> as these are not practical in an LWC component.
    const topLevelWrappingMap: { [key: string]: string[] } = {
        caption: ['table'],
        col: ['colgroup', 'table'],
        colgroup: ['table'],
        option: ['select'],
        tbody: ['table'],
        td: ['tr', 'tbody', 'table'],
        th: ['tr', 'tbody', 'table'],
        thead: ['table'],
        tfoot: ['table'],
        tr: ['tbody', 'table'],
    };

    // Via https://github.com/webcomponents/polyfills/blob/ee1db33/packages/template/template.js#L282-L288
    const getTagName = function (text: string) {
        return (/<([a-z][^/\0>\x20\t\r\n\f]+)/i.exec(text) || ['', ''])[1].toLowerCase();
    };

    // Via https://github.com/webcomponents/polyfills/blob/ee1db33/packages/template/template.js#L295-L320
    createFragment = function (html: string) {
        const wrapperTags = topLevelWrappingMap[getTagName(html)];
        if (!isUndefined(wrapperTags)) {
            for (const wrapperTag of wrapperTags) {
                html = `<${wrapperTag}>${html}</${wrapperTag}>`;
            }
        }

        // For IE11, the document title must not be undefined, but it can be an empty string
        // https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createHTMLDocument#browser_compatibility
        const doc = document.implementation.createHTMLDocument('');
        doc.body.innerHTML = html;

        let content: Node = doc.body;
        if (!isUndefined(wrapperTags)) {
            for (let i = 0; i < wrapperTags.length; i++) {
                content = content.firstChild!;
            }
        }

        return content.firstChild;
    };
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

const HTMLElementExported = HTMLElementConstructor as typeof HTMLElement;

export {
    HTMLElementExported,
    insert,
    remove,
    cloneNode,
    createFragment,
    createElement,
    createText,
    createComment,
    nextSibling,
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
    isConnected,
    assertInstanceOfHTMLElement,
    defineCustomElement,
    getCustomElement,
};
