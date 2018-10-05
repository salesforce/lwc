import { getOwnPropertyDescriptor, hasOwnProperty, isUndefined } from "../shared/language";

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

const nodeValueSetter: (this: Node, value: string) => void = getOwnPropertyDescriptor(Node.prototype, 'nodeValue')!.set!;

const parentElementGetter: (this: Node) => Element | null = hasOwnProperty.call(Node.prototype, 'parentElement') ?
    getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!;  // IE11

const elementTagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(Element.prototype, 'tagName')!.get!;

const dispatchEvent = 'EventTarget' in window ?
    EventTarget.prototype.dispatchEvent :
    Node.prototype.dispatchEvent; // IE11

const ElementInnerHTMLSetter: (this: Element, s: string) => void = hasOwnProperty.call(Element.prototype, 'innerHTML') ?
    getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!.set! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'innerHTML')!.set!;  // IE11

const isNativeShadowRootAvailable = !isUndefined((window as any).ShadowRoot) && (window as any).ShadowRoot.prototype instanceof DocumentFragment;

const ShadowRootInnerHTMLSetter: (this: ShadowRoot, s: string) => void = isNativeShadowRootAvailable ? getOwnPropertyDescriptor((window as any).ShadowRoot.prototype, 'innerHTML')!.set! : () => {
    throw new Error('Internal Error: Missing ShadowRoot');
};

export {
    dispatchEvent,
    setAttribute,
    getAttribute,
    setAttributeNS,
    getAttributeNS,
    removeAttribute,
    removeAttributeNS,
    nodeValueSetter,
    parentElementGetter,
    elementTagNameGetter,
    addEventListener,
    removeEventListener,
    ElementInnerHTMLSetter,
    ShadowRootInnerHTMLSetter,

    insertBefore,
    removeChild,
    appendChild,
    hasChildNodes,

    isNativeShadowRootAvailable,
};
