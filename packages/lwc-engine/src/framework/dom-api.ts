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

const ShadowRootHostGetter: (this: ShadowRoot) => Element | null = typeof (window as any).ShadowRoot !== "undefined" ?
    getOwnPropertyDescriptor((window as any).ShadowRoot.prototype, 'host')!.get! :
    () => {
        throw new Error('Internal Error: Missing ShadowRoot');
    };

const dispatchEvent = 'EventTarget' in window ?
    EventTarget.prototype.dispatchEvent :
    Node.prototype.dispatchEvent; // IE11

const ElementInnerHTMLSetter: (this: Element, s: string) => void = hasOwnProperty.call(Element.prototype, 'innerHTML') ?
    getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!.set! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML')!.set!;  // IE11

const ShadowRootInnerHTMLSetter: (this: ShadowRoot, s: string) => void = typeof (window as any).ShadowRoot !== "undefined" ? getOwnPropertyDescriptor((window as any).ShadowRoot.prototype, 'innerHTML')!.set! : () => {
    throw new Error('Internal Error: Missing ShadowRoot');
};

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
    ShadowRootHostGetter,
    addEventListener,
    removeEventListener,
    ElementInnerHTMLSetter,
    ShadowRootInnerHTMLSetter,

    insertBefore,
    removeChild,
    appendChild,
    hasChildNodes,

    BaseCustomElementProto,
};
