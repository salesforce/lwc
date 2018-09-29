import assert from "../shared/assert";
import { init } from "../3rdparty/snabbdom/snabbdom";
import { DOMAPI } from "../3rdparty/snabbdom/types";
import props from "./modules/props";
import attrs from "./modules/attrs";
import styles from "./modules/styles";
import classes from "./modules/classes";
import events from "./modules/events";
import shadowAttribute from "lwc-engine/src/framework/modules/shadow-attribute";
import { isUndefined, isFalse, isTrue } from "../shared/language";
import { getInternalField } from "../shared/fields";
import {
    parentNodeGetter,
    insertBefore,
    removeChild,
    appendChild,
} from "./dom-api";
import { VM, setNodeOwnerKey } from "./vm";
import { ViewModelReflection } from "./utils";
import { patchSlotElementWithRestrictions } from "./restrictions";

const {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
    createDocumentFragment,
} = document;

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
const htmlDomApi: DOMAPI = {
    createFragment(): DocumentFragment {
        return createDocumentFragment.call(document);
    },
    createElement(tagName: string, uid: number): HTMLElement {
        const element = createElement.call(document, tagName);
        setNodeOwnerKey(element, uid);
        if (process.env.NODE_ENV !== 'production') {
            if (tagName === 'slot') {
                patchSlotElementWithRestrictions(element as HTMLSlotElement);
            }
        }
        return element;
    },
    createElementNS(namespaceURI: string, qualifiedName: string, uid: number): Element {
        const element = createElementNS.call(document, namespaceURI, qualifiedName);
        setNodeOwnerKey(element, uid);
        return element;
    },
    createTextNode(text: string, uid: number): Text {
        const textNode = createTextNode.call(document, text);
        setNodeOwnerKey(textNode, uid);
        return textNode;
    },
    createComment(text: string, uid: number): Comment {
        const comment = createComment.call(document, text);
        setNodeOwnerKey(comment, uid);
        return comment;
    },
    insertBefore(parent: Node, newNode: Node, referenceNode: Node | null) {
        const vm: VM | undefined = getInternalField(parent, ViewModelReflection);
        parent = remapNodeIfFallbackIsNeeded(vm, parent);
        insertBefore.call(parent, newNode, referenceNode);
    },
    removeChild(node: Node, child: Node) {
        const vm: VM | undefined = getInternalField(node, ViewModelReflection);
        node = remapNodeIfFallbackIsNeeded(vm, node);
        removeChild.call(node, child);
    },
    appendChild(node: Node, child: Node) {
        const vm: VM | undefined = getInternalField(node, ViewModelReflection);
        if (process.env.NODE_ENV !== 'production') {
            if (!isUndefined(vm) && isTrue(vm.fallback)) {
                assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
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
    shadowAttribute,
], htmlDomApi);

const patchChildren = patchVNode.children;

export { patchChildren };
