/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasOwnProperty, getOwnPropertyDescriptor } from '../shared/language';

const {
    hasAttribute,
    getAttribute,
    setAttribute,
    removeAttribute,
    querySelectorAll,
    getBoundingClientRect,
    getElementsByTagName,
    getElementsByTagNameNS,
} = Element.prototype;

const { addEventListener, removeEventListener } = Element.prototype;

const innerHTMLSetter: (this: Element, s: string) => void = hasOwnProperty.call(
    Element.prototype,
    'innerHTML'
)
    ? getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!.set!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML')!.set!; // IE11

const outerHTMLSetter: (this: Element, s: string) => void = hasOwnProperty.call(
    Element.prototype,
    'outerHTML'
)
    ? getOwnPropertyDescriptor(Element.prototype, 'outerHTML')!.set!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'outerHTML')!.set!; // IE11

const tagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(
    Element.prototype,
    'tagName'
)!.get!;

const tabIndexGetter = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex')!.get as (
    this: HTMLElement
) => number;
const matches: (this: Element, selector: string) => boolean = hasOwnProperty.call(
    Element.prototype,
    'matches'
)
    ? Element.prototype.matches
    : (Element.prototype as any).msMatchesSelector; // IE11

const childrenGetter: (this: HTMLElement) => HTMLCollectionOf<Element> = hasOwnProperty.call(
    Element.prototype,
    'children'
)
    ? getOwnPropertyDescriptor(Element.prototype, 'children')!.get!
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'children')!.get!; // IE11

// for IE11, access from HTMLElement
// for all other browsers access the method from the parent Element interface
const { getElementsByClassName } = HTMLElement.prototype;

export {
    addEventListener,
    removeEventListener,
    hasAttribute,
    getAttribute,
    setAttribute,
    removeAttribute,
    querySelectorAll,
    getBoundingClientRect,
    getElementsByTagName,
    getElementsByClassName,
    getElementsByTagNameNS,
    tagNameGetter,
    tabIndexGetter,
    innerHTMLSetter,
    outerHTMLSetter,
    matches,
    childrenGetter,
};
