/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, hasOwnProperty } from '../shared/language';

const DocumentPrototypeActiveElement: (this: Document) => Element | null = getOwnPropertyDescriptor(
    Document.prototype,
    'activeElement'
)!.get!;

const elementFromPoint: (x: number, y: number) => Element | null = hasOwnProperty.call(
    Document.prototype,
    'elementFromPoint'
)
    ? Document.prototype.elementFromPoint
    : (Document.prototype as any).msElementFromPoint; // IE11

// TODO: when does defaultView return a null?
const defaultViewGetter: (this: Document) => Window | null = getOwnPropertyDescriptor(
    Document.prototype,
    'defaultView'
)!.get!;

const {
    createComment,
    querySelectorAll,
    getElementById,
    getElementsByClassName,
    getElementsByTagName,
    getElementsByTagNameNS,
} = Document.prototype;

// In Firefox v57 and lower, getElementsByName is defined on HTMLDocument.prototype
// In all other browsers have the method on Document.prototype
const { getElementsByName } = HTMLDocument.prototype;

export {
    elementFromPoint,
    createComment,
    DocumentPrototypeActiveElement,
    querySelectorAll,
    getElementById,
    getElementsByClassName,
    getElementsByName,
    getElementsByTagName,
    getElementsByTagNameNS,
    defaultViewGetter,
};
