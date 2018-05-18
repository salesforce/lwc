import { init } from "../3rdparty/snabbdom/snabbdom";
import { DOMAPI } from "../3rdparty/snabbdom/types";
import props from "./modules/props";
import attrs from "./modules/attrs";
import styles from "./modules/styles";
import classes from "./modules/classes";
import events from "./modules/events";
import token from "./modules/token";
import uid from "./modules/uid";
import shadow from "./modules/shadow";
import { isNull } from './language';

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
    return node.parentNode;
}
function nextSibling(node: Node): Node | null {
    return node.nextSibling;
}
function setTextContent(node: Node, text: string) {
    node.nodeValue = text;
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
        insertBefore.call(parent, newNode, referenceNode);
    },
    removeChild(node: Node, child: Node) {
        if (!isNull(node)) {
            removeChild.call(node, child);
        }
    },
    appendChild(node: Node, child: Node) {
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
    shadow,
], htmlDomApi);

const patchChildren = patchVNode.children;

export { patchChildren };
