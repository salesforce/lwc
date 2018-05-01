import { VNode, Module } from "../../3rdparty/snabbdom/types";
import {
    lightDOMQuerySelector,
    lightDOMQuerySelectorAll,
} from "../html-element";
import { defineProperties } from "../language";

const querySelectorDescriptors: PropertyDescriptorMap = {
    querySelector: {
        value: lightDOMQuerySelector,
        configurable: true,
    },
    querySelectorAll: {
        value: lightDOMQuerySelectorAll,
        configurable: true,
    }
};

function create(oldVnode: VNode, vnode: VNode) {
    const elm = vnode.elm as Element;
    defineProperties(elm, querySelectorDescriptors);
}
const propsModule: Module = {
    create,
};
export default propsModule;
