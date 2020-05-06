/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { Renderer } from '@lwc/engine-core';
import { hasOwnProperty, isUndefined } from '@lwc/shared';

// TODO [#0]: Evaluate how we can extract the `$shadowToken$` property name in a shared package
// to avoid having to synchronize it between the different modules.
export const syntheticShadow = hasOwnProperty.call(Element.prototype, '$shadowToken$');

function createStyleElement(text: string): HTMLStyleElement {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = text;
    return style;
}

const syntheticShadowStylesheet = new Set<string>();
const syntheticShadowStylesheetContainer = document.head || document.body || document;

function syntheticShadowInjectStylesheet(text: string): undefined {
    if (syntheticShadowStylesheet.has(text)) {
        return;
    }

    syntheticShadowStylesheet.add(text);

    const style = createStyleElement(text);
    syntheticShadowStylesheetContainer.appendChild(style);
}

const nativeShadowStyleCache = new Map<string, HTMLStyleElement>();

function nativeShadowInjectStyleSheet(text: string): HTMLStyleElement {
    let cachedStyle = nativeShadowStyleCache.get(text);

    if (isUndefined(cachedStyle)) {
        cachedStyle = createStyleElement(text);
        nativeShadowStyleCache.set(text, cachedStyle);
    }

    return cachedStyle.cloneNode() as HTMLStyleElement;
}

export const renderer: Renderer<Node, Element> = {
    ssr: false,
    syntheticShadow,

    createElement(tagName, namespace) {
        return isUndefined(namespace)
            ? document.createElement(tagName)
            : document.createElementNS(namespace, tagName);
    },

    createText(content) {
        return document.createTextNode(content);
    },

    insert(node, parent, anchor) {
        parent.insertBefore(node, anchor);
    },

    remove(node, parent) {
        parent.removeChild(node);
    },

    innerHTML(element, text) {
        // TODO [#0]: This is problematic because of the restrictions. Invoking directly innerHTML on the shadow root
        // triggers the restrictions.
        element.innerHTML = text;
    },

    attachShadow(element, options) {
        return element.attachShadow(options);
    },

    setText(node, content) {
        node.nodeValue = content;
    },

    getAttribute(element, name, namespace) {
        return isUndefined(namespace)
            ? element.getAttribute(name)
            : element.getAttributeNS(namespace, name);
    },

    setAttribute(element, name, value, namespace) {
        if (isUndefined(namespace)) {
            element.setAttribute(name, value);
        } else {
            element.setAttributeNS(namespace, name, value);
        }
    },
    removeAttribute(element, name, namespace) {
        if (isUndefined(namespace)) {
            element.removeAttribute(name);
        } else {
            element.removeAttributeNS(namespace, name);
        }
    },

    addEventListener(target, type, callback, options) {
        target.addEventListener(type, callback, options);
    },

    removeEventListener(target, type, callback, options) {
        target.removeEventListener(type, callback, options);
    },

    dispatchEvent(target, event) {
        return target.dispatchEvent(event);
    },

    getClassList(element) {
        return element.classList;
    },

    getStyleDeclaration(element) {
        // TODO [#0]: How to avoid this type casting? Shall we use a different type interface to
        // represent elements in the engine?
        return (element as HTMLElement | SVGElement).style;
    },

    getBoundingClientRect(element) {
        return element.getBoundingClientRect();
    },

    querySelector(element, selectors) {
        return element.querySelector(selectors);
    },

    querySelectorAll(element, selectors) {
        return element.querySelectorAll(selectors);
    },

    getElementsByTagName(element, tagNameOrWildCard) {
        return element.getElementsByTagName(tagNameOrWildCard);
    },

    getElementsByClassName(element, names) {
        return element.getElementsByClassName(names);
    },

    isConnected(node) {
        return node.isConnected;
    },

    injectStylesheet: syntheticShadow
        ? syntheticShadowInjectStylesheet
        : nativeShadowInjectStyleSheet,
};
