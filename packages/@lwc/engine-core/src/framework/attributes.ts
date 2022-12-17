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

function offsetPropertyErrorMessage(name: string): string {
    return `Using the \`${name}\` property is an anti-pattern because it rounds the value to an integer. Instead, use the \`getBoundingClientRect\` method to obtain fractional values for the size of an element and its position relative to the viewport.`;
}

// Global HTML Attributes & Properties
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
//
// If you update this list, check for test files that recapitulate the same list. Searching the codebase
// for e.g. "dropzone" should suffice.
export const globalHtmlElementPropertyNames = [
    'accessKey',
    'accessKeyLabel',
    'className',
    'contentEditable',
    'dataset',
    'dir',
    'draggable',
    'dropzone',
    'hidden',
    'id',
    'inputMode',
    'isContentEditable',
    'lang',
    'offsetHeight',
    'offsetLeft',
    'offsetParent',
    'offsetTop',
    'offsetWidth',
    'role',
    'slot',
    'spellcheck',
    'style',
    'tabIndex',
    'title',
    'translate',
] as const;

// This mapping is deliberately kept separate from the array of property names above because the mapping object is
// needed only for dev mode, whereas the above array is needed in prod mode too. This makes the bundle size lower.
export const globalHTMLProperties: {
    [Key in typeof globalHtmlElementPropertyNames[number]]: {
        attribute?: string;
        error?: string;
        readOnly?: boolean;
    };
} = {
    accessKey: {
        attribute: 'accesskey',
    },
    accessKeyLabel: {
        readOnly: true,
    },
    className: {
        attribute: 'class',
        error: 'Using the `className` property is an anti-pattern because of slow runtime behavior and potential conflicts with classes provided by the owner element. Use the `classList` API instead.',
    },
    contentEditable: {
        attribute: 'contenteditable',
    },
    dataset: {
        readOnly: true,
        error: "Using the `dataset` property is an anti-pattern because it can't be statically analyzed. Expose each property individually using the `@api` decorator instead.",
    },
    dir: {
        attribute: 'dir',
    },
    draggable: {
        attribute: 'draggable',
    },
    dropzone: {
        attribute: 'dropzone',
        readOnly: true,
    },
    hidden: {
        attribute: 'hidden',
    },
    id: {
        attribute: 'id',
    },
    // additional "global attributes" that are not present in the link above.
    isContentEditable: {
        readOnly: true,
    },
    inputMode: {
        attribute: 'inputmode',
    },
    lang: {
        attribute: 'lang',
    },
    offsetHeight: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetHeight'),
    },
    offsetLeft: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetLeft'),
    },
    offsetParent: {
        readOnly: true,
    },
    offsetTop: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetTop'),
    },
    offsetWidth: {
        readOnly: true,
        error: offsetPropertyErrorMessage('offsetWidth'),
    },
    role: {
        attribute: 'role',
    },
    slot: {
        attribute: 'slot',
        error: 'Using the `slot` property is an anti-pattern.',
    },
    spellcheck: {
        attribute: 'spellcheck',
    },
    style: {
        attribute: 'style',
    },
    tabIndex: {
        attribute: 'tabindex',
    },
    title: {
        attribute: 'title',
    },
    translate: {
        attribute: 'translate',
    },
};

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
