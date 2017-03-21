import { invokeComponentAttributeChangedCallback } from "../invoker.js";
import { create } from "../language.js";

const EmptyObj = create(null);

function observeAttributes(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (!vm) {
        return;
    }

    let { data: { attrs: oldAttrs } } = oldVnode;
    let { data: { attrs: newAttrs } } = vnode;

    // infuse key-value pairs from _props into the component
    if (oldAttrs !== newAttrs && (oldAttrs || newAttrs)) {
        const { def: { observedAttrs } } = vm;

        let key: string, cur: any;
        oldAttrs = oldAttrs || EmptyObj;
        newAttrs = newAttrs || EmptyObj;
        // removed props should be reset in component's props
        for (key in oldAttrs) {
            if (!(key in newAttrs)) {
                invokeComponentAttributeChangedCallback(vm, key, observedAttrs[key], null);
            }
        }

        // new or different props should be set in component's props
        for (key in newAttrs) {
            cur = newAttrs[key];
            if (!(key in oldAttrs) || oldAttrs[key] != cur) {
                invokeComponentAttributeChangedCallback(vm, key, oldAttrs[key], cur);
            }
        }
    }
}

export default {
    create: observeAttributes,
    update: observeAttributes,
};
