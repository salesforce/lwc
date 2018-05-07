import {
    isUndefined,
    isNull,
} from '../language';
import { ViewModelReflection } from "../utils";

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

function findShadowRoot(node) {
    let root = node;
    while (isUndefined(root[ViewModelReflection])) {
        root = root.parentNode;
    }
    return root;
}

function findComposedRootNode(node: Node) {
    while (node !== document) {
        const parent = node.parentNode;
        if (isNull(parent)) {
            return node;
        }
        node = parent;
    }
    return node;
}

// This is our own implementation that works with both, shadow-root and piercing shadow-root polyfill.
function getRootNode(this: Node, options: Record<string, any> | undefined): Node {
    const composed: boolean = isUndefined(options) ? false : !!options.composed;
    if (!composed) {
        return findShadowRoot(this.parentNode); // this is not quite the root (it is the host), but for us is sufficient
    }
    return findComposedRootNode(this);
}

export {
    // Node.prototype
    compareDocumentPosition,
    getRootNode,
    insertBefore,
    removeChild,
    appendChild,

    // Node
    DOCUMENT_POSITION_CONTAINS,
    DOCUMENT_POSITION_CONTAINED_BY,
};
