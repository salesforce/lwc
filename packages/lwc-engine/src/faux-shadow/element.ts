import { getOwnPropertyDescriptor, hasOwnProperty } from "../shared/language";

const {
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
} = Element.prototype;

const innerHTMLSetter: (this: Element, s: string) => void = hasOwnProperty.call(Element.prototype, 'innerHTML') ?
    getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!.set! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML')!.set!;  // IE11

const tagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(Element.prototype, 'tagName')!.get!;

const tabIndexGetter = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex')!.get as (this: HTMLElement) => number;

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
    innerHTMLSetter,
    tagNameGetter,
    getBoundingClientRect,
    tabIndexGetter,
};
