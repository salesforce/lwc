/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasOwnProperty, getOwnPropertyDescriptor } from '@lwc/shared';

const {
    addEventListener,
    attachShadow,
    getAttribute,
    getBoundingClientRect,
    getElementsByTagName,
    getElementsByTagNameNS,
    hasAttribute,
    querySelectorAll,
    removeAttribute,
    removeEventListener,
    setAttribute,
} = Element.prototype;

const childElementCountGetter: (this: ParentNode) => number = getOwnPropertyDescriptor(
    Element.prototype,
    'childElementCount'
)!.get!;

const firstElementChildGetter: (this: ParentNode) => Element | null = getOwnPropertyDescriptor(
    Element.prototype,
    'firstElementChild'
)!.get!;

const lastElementChildGetter: (this: ParentNode) => Element | null = getOwnPropertyDescriptor(
    Element.prototype,
    'lastElementChild'
)!.get!;

const innerHTMLDescriptor = hasOwnProperty.call(Element.prototype, 'innerHTML')
    ? getOwnPropertyDescriptor(Element.prototype, 'innerHTML')
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML'); // IE11

const innerHTMLGetter: (this: Element) => string = innerHTMLDescriptor!.get!;
const innerHTMLSetter: (this: Element, s: string) => void = innerHTMLDescriptor!.set!;

const outerHTMLDescriptor = hasOwnProperty.call(Element.prototype, 'outerHTML')
    ? getOwnPropertyDescriptor(Element.prototype, 'outerHTML')
    : getOwnPropertyDescriptor(HTMLElement.prototype, 'outerHTML'); // IE11

const outerHTMLGetter: (this: Element) => string = outerHTMLDescriptor!.get!;
const outerHTMLSetter: (this: Element, s: string) => void = outerHTMLDescriptor!.set!;

const tagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(
    Element.prototype,
    'tagName'
)!.get!;

const tabIndexDescriptor = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex');
const tabIndexGetter: (this: HTMLElement) => number = tabIndexDescriptor!.get!;
const tabIndexSetter: (this: HTMLElement, v: any) => void = tabIndexDescriptor!.set!;

const matches: (this: Element, selector: string) => boolean = hasOwnProperty.call(
    Element.prototype,
    'matches'
)
    ? Element.prototype.matches
    : (Element.prototype as any).msMatchesSelector; // IE11

const childrenGetter: (this: ParentNode) => HTMLCollectionOf<Element> = hasOwnProperty.call(
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
    attachShadow,
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
    tabIndexSetter,
    innerHTMLGetter,
    innerHTMLSetter,
    outerHTMLGetter,
    outerHTMLSetter,
    matches,
    childrenGetter,
    childElementCountGetter,
    firstElementChildGetter,
    lastElementChildGetter,
};
