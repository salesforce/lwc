import {
    isUndefined,
    isNull,
    hasOwnProperty,
    getOwnPropertyDescriptor,
    defineProperties,
} from '../shared/language';

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
    compareDocumentPosition,
} = Node.prototype;

const textContextSetter: (this: Node, s: string) => void = getOwnPropertyDescriptor(Node.prototype, 'textContent')!.set!;
const parentNodeGetter: (this: Node) => Node | null = getOwnPropertyDescriptor(Node.prototype, 'parentNode')!.get!;
const parentElementGetter: (this: Node) => Element | null = hasOwnProperty.call(Node.prototype, 'parentElement') ?
    getOwnPropertyDescriptor(Node.prototype, 'parentElement')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')!.get!;  // IE11

const childNodesGetter: (this: Node) => NodeList = hasOwnProperty.call(Node.prototype, 'childNodes') ?
    getOwnPropertyDescriptor(Node.prototype, 'childNodes')!.get! :
    getOwnPropertyDescriptor(HTMLElement.prototype, 'childNodes')!.get!;  // IE11

export {
    // Node.prototype
    compareDocumentPosition,
    insertBefore,
    removeChild,
    appendChild,
    parentNodeGetter,
    parentElementGetter,
    childNodesGetter,
    textContextSetter,

    // Node
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_PRECEDING,
    DOCUMENT_POSITION_FOLLOWING,
};

const NodePatchDescriptors: PropertyDescriptorMap = {};

export function patchNode(node: Node) {
    // TODO: we are nos invoking this yet, but it will be interesting to do
    // so for any element from the template.
    defineProperties(node, NodePatchDescriptors);
}

// DO NOT CHANGE this:
// these two values need to be in sync with framework/vm.ts
const OwnerKey = '$$OwnerKey$$';
const OwnKey = '$$OwnKey$$';

export function getNodeOwnerKey(node: Node): number | undefined {
    let ownerKey: number | undefined;
    // search for the first element with owner identity (just in case of manually inserted elements)
    while (!isNull(node) && isUndefined((ownerKey = node[OwnerKey]))) {
        node = parentNodeGetter.call(node);
    }
    return ownerKey;
}

export function getNodeKey(node: Node): number | undefined {
    return node[OwnKey];
}
