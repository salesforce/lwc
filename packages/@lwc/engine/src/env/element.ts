/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getOwnPropertyDescriptor } from '../shared/language';

const {
    hasAttribute,
    getAttribute,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
} = Element.prototype;

const tagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(
    Element.prototype,
    'tagName'
)!.get!;

export {
    hasAttribute,
    getAttribute,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    tagNameGetter,
};
