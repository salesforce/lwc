/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    assert,
    create,
    hasOwnProperty,
    htmlPropertyToAttribute,
    isFunction,
    isUndefined,
    KEY__SHADOW_TOKEN,
    setPrototypeOf,
    StringToLowerCase,
} from '@lwc/shared';
import { Renderer } from '@lwc/engine-core';

const globalStylesheets: { [content: string]: true } = create(null);

if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__lwcResetGlobalStylesheets = () => {
        for (const key of Object.keys(globalStylesheets)) {
            delete globalStylesheets[key];
        }
    };
}

const globalStylesheetsParentElement: Element = document.head || document.body || document;
const supportsConstructableStyleSheets = isFunction((CSSStyleSheet.prototype as any).replaceSync);
const styleElements: { [content: string]: HTMLStyleElement } = create(null);
const styleSheets: { [content: string]: CSSStyleSheet } = create(null);
const nodesToStyleSheets = new WeakMap<Node, { [content: string]: true }>();

let getCustomElement, defineCustomElement, HTMLElementConstructor;

function isCustomElementRegistryAvailable() {
    if (typeof customElements === 'undefined') {
        return false;
    }
    try {
        // dereference HTMLElement global because babel wraps globals in compat mode with a
        // _wrapNativeSuper()
        // This is a problem because LWCUpgradableElement extends renderer.HTMLElement which does not
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

function insertConstructableStyleSheet(content: string, target: Node) {
    // It's important for CSSStyleSheets to be unique based on their content, so that
    // `shadowRoot.adoptedStyleSheets.includes(sheet)` works.
    let styleSheet = styleSheets[content];
    if (isUndefined(styleSheet)) {
        styleSheet = new CSSStyleSheet();
        (styleSheet as any).replaceSync(content);
        styleSheets[content] = styleSheet;
    }
    if (!(target as any).adoptedStyleSheets.includes(styleSheet)) {
        (target as any).adoptedStyleSheets = [...(target as any).adoptedStyleSheets, styleSheet];
    }
}

function insertStyleElement(content: string, target: Node) {
    // Avoid inserting duplicate `<style>`s
    let sheets = nodesToStyleSheets.get(target);
    if (isUndefined(sheets)) {
        sheets = create(null);
        nodesToStyleSheets.set(target, sheets!);
    }
    if (sheets![content]) {
        return;
    }
    sheets![content] = true;

    // This `<style>` may be repeated multiple times in the DOM, so cache it. It's a bit
    // faster to call `cloneNode()` on an existing node than to recreate it every time.
    let elm = styleElements[content];
    if (isUndefined(elm)) {
        elm = document.createElement('style');
        elm.type = 'text/css';
        elm.textContent = content;
        styleElements[content] = elm;
    } else {
        elm = elm.cloneNode(true) as HTMLStyleElement;
    }
    target.appendChild(elm);
}

if (isCustomElementRegistryAvailable()) {
    getCustomElement = customElements.get.bind(customElements);
    defineCustomElement = customElements.define.bind(customElements);
    HTMLElementConstructor = HTMLElement;
} else {
    const registry: Record<string, CustomElementConstructor> = create(null);
    const reverseRegistry: WeakMap<CustomElementConstructor, string> = new WeakMap();

    defineCustomElement = function define(name: string, ctor: CustomElementConstructor) {
        if (name !== StringToLowerCase.call(name) || registry[name]) {
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
        setPrototypeOf(elm, constructor.prototype);
        return elm;
    };
    HTMLElementConstructor.prototype = HTMLElement.prototype;
}

export const renderer: Renderer<Node, Element> = {
    ssr: false,

    syntheticShadow: hasOwnProperty.call(Element.prototype, KEY__SHADOW_TOKEN),

    createElement(tagName: string, namespace: string): Element {
        return isUndefined(namespace)
            ? document.createElement(tagName)
            : document.createElementNS(namespace, tagName);
    },

    createText(content: string): Node {
        return document.createTextNode(content);
    },

    createComment(content: string): Node {
        return document.createComment(content);
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
                    }>. This is likely a typo on the corresponding attribute "${htmlPropertyToAttribute(
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

    setCSSStyleProperty(element: Element, name: string, value: string, important: boolean): void {
        // TODO [#0]: How to avoid this type casting? Shall we use a different type interface to
        // represent elements in the engine?
        (element as HTMLElement | SVGElement).style.setProperty(
            name,
            value,
            important ? 'important' : ''
        );
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

    insertStylesheet(content: string, target: Node): void {
        if (supportsConstructableStyleSheets) {
            insertConstructableStyleSheet(content, target);
        } else {
            // Fall back to <style> element
            insertStyleElement(content, target);
        }
    },

    assertInstanceOfHTMLElement(elm: any, msg: string) {
        assert.invariant(elm instanceof HTMLElement, msg);
    },

    defineCustomElement,
    getCustomElement,
    HTMLElement: HTMLElementConstructor as any,
};
