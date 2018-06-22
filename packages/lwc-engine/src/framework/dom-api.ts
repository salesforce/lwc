import { getOwnPropertyDescriptor, hasOwnProperty } from "./language";

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

const parentNodeGetter = getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!;

const parentElementGetter = hasOwnProperty.call(Node.prototype, 'parentElement') ?
    getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!;  // IE11

const dispatchEvent = 'EventTarget' in window ?
    EventTarget.prototype.dispatchEvent :
    Node.prototype.dispatchEvent; // IE11

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
    addEventListener,
    removeEventListener,
};
