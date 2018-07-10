import {
    isUndefined,
    isNull,
    hasOwnProperty,
    getOwnPropertyDescriptor,
    isTrue,
    defineProperties,
} from '../shared/language';

const {
    DOCUMENT_POSITION_CONTAINED_BY,
    DOCUMENT_POSITION_CONTAINS,
} = Node;

const {
    insertBefore,
    removeChild,
    appendChild,
    compareDocumentPosition,
} = Node.prototype;

/**
 * Returns the context shadow included root.
 */
function findShadowRoot(node: Node): Node {
    const initialParent = parentNodeGetter.call(node);
    // We need to ensure that the parent element is present before accessing it.
    if (isNull(initialParent)) {
        return node;
    }

    // In the case of LWC, the root and the host element are the same things. Therefor,
    // when calling findShadowRoot on the a host element we want to return the parent host
    // element and not the current host element.
    node = initialParent;
    let nodeParent;
    while (
        !isNull(nodeParent = parentNodeGetter.call(node)) &&
        isUndefined(getNodeKey(node))
    ) {
        node = nodeParent;
    }

    return node;
}

function findComposedRootNode(node: Node): Node {
    let nodeParent;
    while (!isNull(nodeParent = parentNodeGetter.call(node))) {
        node = nodeParent;
    }

    return node;
}

/**
 * Dummy implementation of the Node.prototype.getRootNode.
 * Spec: https://dom.spec.whatwg.org/#dom-node-getrootnode
 *
 * TODO: Once we start using the real shadowDOM, this method should be replaced by:
 * const { getRootNode } = Node.prototype;
 */
function getRootNode(
    this: Node,
    options?: { composed?: boolean }
): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;

    return isTrue(composed) ?
        findComposedRootNode(this) :
        findShadowRoot(this);
}

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
    getRootNode,
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
    return node[OwnerKey];
}

export function getNodeKey(node: Node): number | undefined {
    return node[OwnKey];
}
