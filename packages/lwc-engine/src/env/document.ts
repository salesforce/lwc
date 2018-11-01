const { getOwnPropertyDescriptor, hasOwnProperty } = Object;

const DocumentPrototypeActiveElement = getOwnPropertyDescriptor(Document.prototype, 'activeElement')!.get as (this: Document) => Element | null;

const elementsFromPoint = hasOwnProperty.call(Document.prototype, 'elementsFromPoint') ?
    Document.prototype.elementsFromPoint :
    Document.prototype.msElementsFromPoint;  // IE11

const {
    createDocumentFragment,
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    querySelector,
    querySelectorAll,
    getElementById,
    getElementsByClassName,
    getElementsByName,
    getElementsByTagName,
    getElementsByTagNameNS,
} = Document.prototype;

export {
    createDocumentFragment,
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    DocumentPrototypeActiveElement,
    elementsFromPoint,
    querySelector,
    querySelectorAll,
    getElementById,
    getElementsByClassName,
    getElementsByName,
    getElementsByTagName,
    getElementsByTagNameNS,
};
