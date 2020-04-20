/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { Renderer } from '@lwc/engine-core';
import { hasOwnProperty, isUndefined } from '@lwc/shared';

const { appendChild, insertBefore, replaceChild, removeChild } = Element.prototype;
export { appendChild, insertBefore, replaceChild, removeChild };

export const useSyntheticShadow = hasOwnProperty.call(Element.prototype, '$shadowToken$');

export const renderer: Renderer<Node, Element> = {
    useSyntheticShadow,
    insert(node, parent, anchor) {
        parent.insertBefore(node, anchor);
    },
    remove(node, parent) {
        parent.removeChild(node);
    },
    createElement(tagName, namespace) {
        return isUndefined(namespace)
            ? document.createElement(tagName)
            : document.createElementNS(namespace, tagName);
    },
    createText(content) {
        return document.createTextNode(content);
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
    addEventListener(target, type, callback) {
        target.addEventListener(type, callback);
    },
    removeEventListener(target, type, callback) {
        target.removeEventListener(type, callback);
    },
    dispatchEvent(target, event) {
        return target.dispatchEvent(event);
    },
    getClassList(element) {
        return element.classList;
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
};
