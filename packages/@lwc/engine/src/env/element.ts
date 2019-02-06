/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasOwnProperty, getOwnPropertyDescriptor } from "../shared/language";

const {
    hasAttribute,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
    getBoundingClientRect,
    getElementsByTagName,
    getElementsByClassName,
    getElementsByTagNameNS,
} = Element.prototype;

let {
    addEventListener,
    removeEventListener,
} = Element.prototype;

/**
 * This trick to try to pick up the __lwcOriginal__ out of the intrinsic is to please
 * jsdom, who usually reuse intrinsic between different document.
 */
// @ts-ignore jsdom
addEventListener = addEventListener.__lwcOriginal__ || addEventListener;
// @ts-ignore jsdom
removeEventListener = removeEventListener.__lwcOriginal__ || removeEventListener;

const innerHTMLSetter: (this: Element, s: string) => void = hasOwnProperty.call(Element.prototype, 'innerHTML') ?
    getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!.set! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML')!.set!;  // IE11

const tagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(Element.prototype, 'tagName')!.get!;

const tabIndexGetter = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex')!.get as (this: HTMLElement) => number;
const matches: (this: Element, selector: string) => boolean = hasOwnProperty.call(Element.prototype, 'matches') ?
    Element.prototype.matches :
    (Element.prototype as any).msMatchesSelector; // IE11

const childrenGetter: (this: HTMLElement) => HTMLCollectionOf<Element> = hasOwnProperty.call(Element.prototype, 'children') ?
    getOwnPropertyDescriptor(Element.prototype, 'children')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'children')!.get!;  // IE11

export {
    addEventListener,
    removeEventListener,
    hasAttribute,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
    getBoundingClientRect,
    getElementsByTagName,
    getElementsByClassName,
    getElementsByTagNameNS,
    tagNameGetter,
    tabIndexGetter,
    innerHTMLSetter,
    matches,
    childrenGetter,
};
