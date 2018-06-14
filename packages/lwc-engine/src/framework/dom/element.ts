import { getOwnPropertyDescriptor } from "../language";

const {
    addEventListener,
    removeEventListener,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
} = Element.prototype;

const innerHTMLSetter = getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!.set;

export {
    addEventListener,
    removeEventListener,
    getAttribute,
    getAttributeNS,
    setAttribute,
    setAttributeNS,
    removeAttribute,
    removeAttributeNS,
    querySelector,
    querySelectorAll,
    innerHTMLSetter,
};
