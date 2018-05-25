import assert from "./assert";
import { init } from "../3rdparty/snabbdom/snabbdom";
import { DOMAPI } from "../3rdparty/snabbdom/types";
import props from "./modules/props";
import attrs from "./modules/attrs";
import styles from "./modules/styles";
import classes from "./modules/classes";
import events from "./modules/events";
import token from "./modules/token";
import uid from "./modules/uid";
import { isNull, isUndefined, isFalse, isTrue } from './language';
import { parentNodeGetter } from "./dom/node";
import { VM } from "./vm";
import { ViewModelReflection } from "./utils";

const {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    createDocumentFragment,
} = document;
const {
    insertBefore,
    removeChild,
    appendChild,
} = Node.prototype;
function parentNode(node: Node): Node | null {
    return parentNodeGetter.call(node);
}
function nextSibling(node: Node): Node | null {
    return node.nextSibling;
}
function setTextContent(node: Node, text: string) {
    node.nodeValue = text;
}
function remapNodeIfFallbackIsNeeded(vm: VM | undefined, node: Node): Node {
    // if operation in the fake shadow root, delegate the operation to the host
    return (isUndefined(vm) || isFalse(vm.fallback) || vm.cmpRoot !== node) ?
        node : vm.elm;
}
export const htmlDomApi: DOMAPI = {
    createFragment(): DocumentFragment {
        return createDocumentFragment.call(document);
    },
    createElement(tagName: string): HTMLElement {
        return createElement.call(document, tagName);
    },
    createElementNS(namespaceURI: string, qualifiedName: string): Element {
        return createElementNS.call(document, namespaceURI, qualifiedName);
    },
    createTextNode(text: string): Text {
        return createTextNode.call(document, text);
    },
    createComment(text: string): Comment {
        return createComment.call(document, text);
    },
    insertBefore(parent: Node, newNode: Node, referenceNode: Node | null) {
        const vm: VM = parent[ViewModelReflection];
        parent = remapNodeIfFallbackIsNeeded(vm, parent);
        insertBefore.call(parent, newNode, referenceNode);
    },
    removeChild(node: Node, child: Node) {
        if (!isNull(node)) {
            const vm: VM = node[ViewModelReflection];
            node = remapNodeIfFallbackIsNeeded(vm, node);
            removeChild.call(node, child);
        }
    },
    appendChild(node: Node, child: Node) {
        const vm: VM = node[ViewModelReflection];
        if (process.env.NODE_ENV !== 'production') {
            if (!isUndefined(vm) && isTrue(vm.fallback)) {
                assert.vm(vm);
                assert.invariant(vm.elm !== node, `Internal Error: no insertion should be carry on host element directly when running in fallback mode.`);
            }
        }
        node = remapNodeIfFallbackIsNeeded(vm, node);
        appendChild.call(node, child);
    },
    parentNode,
    nextSibling,
    setTextContent,
};

const patchVNode = init([
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    attrs,
    props,
    classes,
    styles,
    events,
    token,
    uid,
], htmlDomApi);

const patchChildren = patchVNode.children;

export { patchChildren };
