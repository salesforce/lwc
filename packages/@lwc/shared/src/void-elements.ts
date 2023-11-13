/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { HTML_NAMESPACE } from './namespaces';

// Void elements are elements that self-close even without an explicit solidus (slash),
// e.g. `</tagName>` or `<tagName />`. For instance, `<meta>` closes on its own; no need for a slash.
// These only come from HTML; there are no void elements in the SVG or MathML namespaces.
// See: https://html.spec.whatwg.org/multipage/syntax.html#syntax-tags
const VOID_ELEMENTS = [
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

// These elements have been deprecated but preserving their usage for backwards compatibility
// until we can officially deprecate them from LWC.
// See: https://html.spec.whatwg.org/multipage/obsolete.html#obsolete-but-conforming-features
const DEPRECATED_VOID_ELEMENTS = ['param', 'keygen', 'menuitem'];

const VOID_ELEMENTS_SET = /*@__PURE__*/ new Set([...VOID_ELEMENTS, ...DEPRECATED_VOID_ELEMENTS]);

export function isVoidElement(name: string, namespace: string): boolean {
    return namespace === HTML_NAMESPACE && VOID_ELEMENTS_SET.has(name.toLowerCase());
}
