/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor, hasOwnProperty } from '../shared/language';

const DocumentPrototypeActiveElement = getOwnPropertyDescriptor(Document.prototype, 'activeElement')!.get as (
    this: Document,
) => Element | null;

const elementFromPoint = hasOwnProperty.call(Document.prototype, 'elementFromPoint')
    ? Document.prototype.elementFromPoint
    : (Document.prototype as any).msElementFromPoint; // IE11

const {
    createDocumentFragment,
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    querySelector,
    querySelectorAll,
    getElementById,
    getElementsByClassName,
    getElementsByName,
    getElementsByTagName,
    getElementsByTagNameNS,
} = Document.prototype;

export {
    elementFromPoint,
    createDocumentFragment,
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    DocumentPrototypeActiveElement,
    querySelector,
    querySelectorAll,
    getElementById,
    getElementsByClassName,
    getElementsByName,
    getElementsByTagName,
    getElementsByTagNameNS,
};
