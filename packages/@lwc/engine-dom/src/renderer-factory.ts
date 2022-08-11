/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Note: This module cannot import any modules because it is meant to be a pure function.
 *   Type-Only imports are allowed.
 */
import type { RendererAPI } from '@lwc/engine-core';

/**
 * A factory function that produces a renderer.
 * Renderer encapsulates operations that are required to render an LWC component into the underlying
 * runtime environment. In the case of @lwc/enigne-dom, it is meant to be used in a DOM environment.
 * @param createFragment
 * @param globalThis
 * @param insertStylesheet
 * @returns {@link RendererAPI}
 */
export function rendererFactory(
    createFragment: (html: string) => Node | null,
    globalThis: any,
    insertStylesheet: (content: string, target?: ShadowRoot) => void
): RendererAPI {
    // Util functions
    function assertFail(msg: string): never {
        throw new Error(msg);
    }
    function assertInvariant(value: any, msg: string): asserts value {
        if (!value) {
            throw new Error(`Invariant Violation: ${msg}`);
        }
    }

    function isNull(obj: any): obj is null {
        return obj === null;
    }

    function isUndefined(obj: any): obj is undefined {
        return obj === undefined;
    }

    // Note: These keys have to be kept in sync with @lwc/shared
    const KEY__IS_NATIVE_SHADOW_ROOT_DEFINED = '$isNativeShadowRootDefined$';
    const KEY__SHADOW_TOKEN = '$shadowToken$';

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

    const isNativeShadowDefined: boolean = globalThis[KEY__IS_NATIVE_SHADOW_ROOT_DEFINED];
    const isSyntheticShadowDefined: boolean = Object.hasOwnProperty.call(
        Element.prototype,
        KEY__SHADOW_TOKEN
    );

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

    function setProperty(node: Node, key: string, value: any, attributeName: string): void {
        if (process.env.NODE_ENV !== 'production') {
            if (node instanceof Element && !(key in node)) {
                // TODO [#1297]: Move this validation to the compiler
                assertFail(
                    `Unknown public property "${key}" of element <${node.tagName}>. This is likely a typo on the corresponding attribute "${attributeName}".`
                );
            }
        }

        (node as any)[key] = value;
    }

    function getAttribute(
        element: Element,
        name: string,
        namespace?: string | null
    ): string | null {
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
        assertInvariant(elm instanceof HTMLElement, msg);
    }

    const HTMLElementExported = HTMLElementConstructor as typeof HTMLElement;

    return {
        isNativeShadowDefined,
        isSyntheticShadowDefined,
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
        insertStylesheet,
        assertInstanceOfHTMLElement,
        defineCustomElement,
        getCustomElement,
    };
}
