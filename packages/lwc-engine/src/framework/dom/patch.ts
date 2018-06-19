import { defineProperties } from "../language";
import { attachShadowGetter } from "./shadow-root";
import { addEventListenerPatched, removeEventListenerPatched } from "./event";

const CustomElementPatchDescriptors: PropertyDescriptorMap = {
    attachShadow: {
        value: attachShadowGetter,
        writable: true,
        enumerable: true,
        configurable: true,
    },
    addEventListener: {
        value: addEventListenerPatched,
        configurable: true,
        enumerable: true,
    },
    removeEventListener: {
        value: removeEventListenerPatched,
        configurable: true,
        enumerable: true,
    },
};

const NodePatchDescriptors: PropertyDescriptorMap = {};

export function patchCustomElement(elm: HTMLElement): HTMLElement {
    defineProperties(elm, CustomElementPatchDescriptors);
    return elm;
}

export function patchNode(node: Node): Node {
    defineProperties(node, NodePatchDescriptors);
    return node;
}
