/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// These properties get added to LWCElement.prototype publicProps automatically
export const defaultDefHTMLPropertyNames = [
    'accessKey',
    'dir',
    'draggable',
    'hidden',
    'id',
    'lang',
    'spellcheck',
    'tabIndex',
    'title',
];

let controlledElement: Element | null = null;
let controlledAttributeName: string | void;

export function isAttributeLocked(elm: Element, attrName: string): boolean {
    return elm !== controlledElement || attrName !== controlledAttributeName;
}

export function lockAttribute(_elm: Element, _key: string) {
    controlledElement = null;
    controlledAttributeName = undefined;
}

export function unlockAttribute(elm: Element, key: string) {
    controlledElement = elm;
    controlledAttributeName = key;
}
