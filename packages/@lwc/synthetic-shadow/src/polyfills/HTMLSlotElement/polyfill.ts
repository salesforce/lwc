/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ArraySlice, StringCharCodeAt, setPrototypeOf } from '../../shared/language';

const { createElement } = document;

const CHAR_S = 115;
const CHAR_L = 108;
const CHAR_O = 111;
const CHAR_T = 116;

export default function apply() {
    // IE11 does not have this element definition
    // we don't care much about the construction phase, just the prototype
    class HTMLSlotElement {}
    // prototype inheritance dance
    setPrototypeOf(HTMLSlotElement, Node.constructor);
    setPrototypeOf(HTMLSlotElement.prototype, Node.prototype);
    (Window as any).prototype.HTMLSlotElement = HTMLSlotElement;
    // IE11 doesn't have HTMLSlotElement, in which case we
    // need to patch document.createElement to remap `slot`
    // elements to the right prototype
    document.createElement = function(name) {
        const elm = createElement.apply(this, ArraySlice.call(arguments) as [
            string,
            ElementCreationOptions?
        ]);
        if (
            name.length === 4 &&
            StringCharCodeAt.call(name, 0) === CHAR_S &&
            StringCharCodeAt.call(name, 1) === CHAR_L &&
            StringCharCodeAt.call(name, 2) === CHAR_O &&
            StringCharCodeAt.call(name, 2) === CHAR_T
        ) {
            // the new element is the `slot`, resetting the proto chain
            // the new newly created global HTMLSlotElement.prototype
            setPrototypeOf(elm, (window as any).HTMLSlotElement.prototype);
        }
        return elm;
    };
}
