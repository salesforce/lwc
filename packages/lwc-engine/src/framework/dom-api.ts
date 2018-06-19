import { getOwnPropertyDescriptor } from "./language";

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

export {
    setAttribute,
    getAttribute,
    setAttributeNS,
    getAttributeNS,
    removeAttribute,
    removeAttributeNS,
    parentNodeGetter,
    addEventListener,
    removeEventListener,
};
