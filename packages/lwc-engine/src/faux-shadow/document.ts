import { getOwnPropertyDescriptor } from "../shared/language";

const DocumentPrototypeActiveElement = getOwnPropertyDescriptor(Document.prototype, 'activeElement')!.get as (this: Document) => Element | null;

const {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    elementsFromPoint,
} = Document.prototype;

export {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    DocumentPrototypeActiveElement,
    elementsFromPoint,
};
