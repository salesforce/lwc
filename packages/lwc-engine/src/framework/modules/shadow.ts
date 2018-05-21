import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { defineProperties } from './../language';
import { lightDomQuerySelector, lightDomQuerySelectorAll, parentNodeDescriptorValue } from "./../traverse";

const shadowDescriptors: PropertyDescriptorMap = {
    querySelector: {
        value: lightDomQuerySelector,
        configurable: true,
    },
    querySelectorAll: {
        value: lightDomQuerySelectorAll,
        configurable: true,
    },
    parentNode: {
        get: parentNodeDescriptorValue,
        configurable: true,
    },
}

function create(oldVnode: VNode, vnode: VNode) {
    const { elm } = vnode;
    defineProperties(elm, shadowDescriptors);
}
const shadowModule: Module = {
    create,
};
export default shadowModule;
