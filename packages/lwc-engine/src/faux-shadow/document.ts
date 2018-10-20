import { getOwnPropertyDescriptor, hasOwnProperty } from "../shared/language";

const DocumentPrototypeActiveElement = getOwnPropertyDescriptor(Document.prototype, 'activeElement')!.get as (this: Document) => Element | null;

const elementsFromPoint = hasOwnProperty.call(Document.prototype, 'elementsFromPoint') ?
    Document.prototype.elementsFromPoint :
    Document.prototype.msElementsFromPoint;  // IE11

const {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
} = Document.prototype;

export {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    DocumentPrototypeActiveElement,
    elementsFromPoint,
};
