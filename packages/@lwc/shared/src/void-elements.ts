/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Void elements are elements that self-close even without an explicit solidus (slash),
// e.g. `</tagName>` or `<tagName />`. For instance, `<meta>` closes on its own; no need for a slash.
// These only come from HTML; there are no void elements in the SVG or MathML namespaces.
// See: https://html.spec.whatwg.org/multipage/syntax.html#syntax-tags
export const VOID_ELEMENTS = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'source',
    'track',
    'wbr',
];

const VOID_ELEMENTS_SET = new Set(VOID_ELEMENTS);

export function isVoidElement(name: string): boolean {
    return VOID_ELEMENTS_SET.has(name.toLowerCase());
}
