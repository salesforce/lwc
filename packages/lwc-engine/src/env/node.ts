import { getOwnPropertyDescriptor, hasOwnProperty } from "../shared/language";

const {
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
} = Node;

const {
    insertBefore,
    removeChild,
    appendChild,
    hasChildNodes,
    replaceChild,
    compareDocumentPosition,
} = Node.prototype;

const parentNodeGetter: (this: Node) => Element | null = getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!;

const parentElementGetter: (this: Node) => Element | null = hasOwnProperty.call(Node.prototype, 'parentElement') ?
    getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!;  // IE11

const textContextSetter: (this: Node, s: string) => void = getOwnPropertyDescriptor(Node.prototype, 'textContent')!.set!;

const childNodesGetter: (this: Node) => NodeList = hasOwnProperty.call(Node.prototype, 'childNodes') ?
    getOwnPropertyDescriptor(Node.prototype, 'childNodes')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes')!.get!;  // IE11

const nodeValueDescriptor = getOwnPropertyDescriptor(Node.prototype, 'nodeValue')!;

const nodeValueSetter: (this: Node, value: string) => void = nodeValueDescriptor.set!;

const nodeValueGetter: (this: Node) => string = nodeValueDescriptor.get!;

export {
    // Node.prototype
    compareDocumentPosition,
    hasChildNodes,
    insertBefore,
    removeChild,
    replaceChild,
    appendChild,
    parentNodeGetter,
    parentElementGetter,
    childNodesGetter,
    textContextSetter,
    nodeValueGetter,
    nodeValueSetter,

    // Node
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
};
