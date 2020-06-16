/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// The following list contains a mix of both void elements from the HTML and the XML namespace
// without distinction.
export const VOID_ELEMENTS = [
    'area',
    'base',
    'br',
    'circle',
    'col',
    'ellipse',
    'feBlend',
    'feColorMatrix',
    'feFuncR',
    'feFuncG',
    'feFuncB',
    'feFuncA',
    'feImage',
    'feComposite',
    'feConvolveMatrix',
    'feDiffuseLighting',
    'feDisplacementMap',
    'feDropShadow',
    'feFlood',
    'feGaussianBlur',
    'feMerge',
    'feMergeNode',
    'feMorphology',
    'feOffset',
    'feSpecularLighting',
    'feTile',
    'feTurbulence',
    'fePointLight',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'line',
    'link',
    'menuitem',
    'meta',
    'param',
    'rect',
    'source',
    'track',
    'wbr',
];

const VOID_ELEMENTS_SET = new Set(VOID_ELEMENTS);

export function isVoidElement(name: string): boolean {
    return VOID_ELEMENTS_SET.has(name);
}
