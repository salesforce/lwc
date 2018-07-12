import { getOwnPropertyDescriptor, hasOwnProperty } from "../shared/language";

const {
    setAttribute,
    getAttribute,
    setAttributeNS,
    getAttributeNS,
    removeAttribute,
    removeAttributeNS,
    addEventListener,
    removeEventListener,
} = Element.prototype;

const {
    insertBefore,
    removeChild,
    appendChild,
    hasChildNodes,
} = Node.prototype;

const parentNodeGetter: (this: Node) => Node | null = getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!;

const parentElementGetter: (this: Node) => Element | null = hasOwnProperty.call(Node.prototype, 'parentElement') ?
    getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!;  // IE11

const elementTagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(Element.prototype, 'tagName')!.get!;

const dispatchEvent = 'EventTarget' in window ?
    EventTarget.prototype.dispatchEvent :
    Node.prototype.dispatchEvent; // IE11

const BaseCustomElementProto = document.createElement('x-lwc').constructor.prototype;

export {
    dispatchEvent,
    setAttribute,
    getAttribute,
    setAttributeNS,
    getAttributeNS,
    removeAttribute,
    removeAttributeNS,
    parentNodeGetter,
    parentElementGetter,
    elementTagNameGetter,
    addEventListener,
    removeEventListener,

    insertBefore,
    removeChild,
    appendChild,
    hasChildNodes,

    BaseCustomElementProto,
};
