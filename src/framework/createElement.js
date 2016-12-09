import { h, v } from "./api.js";
import { patch } from "./patcher.js";
import {
    createComponent,
} from "./vm.js";
import VMProxy from "./vm-proxy.js";
import VNodeProxy from "./vnode-proxy.js";

const RaptorElementMap = new WeakMap();

const fakeElement = document.createElement('raptor'); // fake element to patch and resolve vnode.elm

export default function createElement(ComponentCtorOrTagName: any): RaptorElement {
    const isHTMLTagName = typeof ComponentCtorOrTagName === "string";
    /**
     * Snabdom does not have a way to process the vnode to produce an element, instead we need to
     * patch the vnode against some fake html element, then we can inspect the element. More here:
     * https://github.com/snabbdom/snabbdom/issues/156
     */
    let element;
    if (isHTMLTagName) {
        const vnode = patch(fakeElement.cloneNode(), h(ComponentCtorOrTagName));
        element = new Proxy(vnode, VNodeProxy);
        RaptorElementMap.set(element, vnode);
    } else {
        const vm = v(ComponentCtorOrTagName);
        createComponent(vm);
        element = new Proxy(vm, VMProxy);
        RaptorElementMap.set(element, vm);
    }
    return element;
}

export function getDOMElement(raptorElement: RaptorElement): HTMLElement {
    if (RaptorElementMap.has(raptorElement)) {
        const vnode = RaptorElementMap.get(raptorElement);
        let element;
        if (vnode.Ctor) {
            element = patch(fakeElement.cloneNode(), vnode).elm;
        } else {
            element = vnode.elm;
        }
        return element;
    }
}

export function getVM(raptorElement: RaptorElement): VM | void {
    if (RaptorElementMap.has(raptorElement)) {
        return RaptorElementMap.get(raptorElement);
    }
}
