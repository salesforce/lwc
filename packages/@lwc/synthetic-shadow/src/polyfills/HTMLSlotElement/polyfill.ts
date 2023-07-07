/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ArraySlice, setPrototypeOf, StringCharCodeAt, defineProperty } from '@lwc/shared';

const { createElement } = Document.prototype;

const CHAR_S = 115;
const CHAR_L = 108;
const CHAR_O = 111;
const CHAR_T = 116;

export default function apply() {
    // IE11 does not have this element definition
    // we don't care much about the construction phase, just the prototype
    class HTMLSlotElement {}
    // prototype inheritance dance
    setPrototypeOf(HTMLSlotElement, HTMLElement.constructor);
    setPrototypeOf(HTMLSlotElement.prototype, HTMLElement.prototype);
    (Window as any).prototype.HTMLSlotElement = HTMLSlotElement;
    // IE11 doesn't have HTMLSlotElement, in which case we
    // need to patch Document.prototype.createElement to remap `slot`
    // elements to the right prototype
    defineProperty(Document.prototype, 'createElement', {
        value: function <K extends keyof HTMLElementTagNameMap>(
            this: Document,
            tagName: K,
            _options?: ElementCreationOptions
        ): HTMLElementTagNameMap[K] | HTMLElement {
            const elm = createElement.apply(
                this,
                ArraySlice.call(arguments) as [string, ElementCreationOptions?]
            );
            if (
                tagName.length === 4 &&
                StringCharCodeAt.call(tagName, 0) === CHAR_S &&
                StringCharCodeAt.call(tagName, 1) === CHAR_L &&
                StringCharCodeAt.call(tagName, 2) === CHAR_O &&
                StringCharCodeAt.call(tagName, 3) === CHAR_T
            ) {
                // the new element is the `slot`, resetting the proto chain
                // the new newly created global HTMLSlotElement.prototype
                setPrototypeOf(elm, HTMLSlotElement.prototype);
            }
            return elm;
        },
    });
}
