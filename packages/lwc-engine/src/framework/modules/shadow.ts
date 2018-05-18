import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { defineProperties } from './../language';
import { lightDomQuerySelector, lightDomQuerySelectorAll } from "./../traverse";

const shadowDescriptors: PropertyDescriptorMap = {
    querySelector: {
        value: lightDomQuerySelector,
        configurable: true,
    },
    querySelectorAll: {
        value: lightDomQuerySelectorAll,
        configurable: true,
    }
}

function create(oldVnode: VNode, vnode: VNode) {
    const { elm } = vnode;
    defineProperties(elm, shadowDescriptors);
}
const shadowModule: Module = {
    create,
};
export default shadowModule;
