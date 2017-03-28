import { invokeComponentAttributeChangedCallback } from "../invoker.js";
import { create, isUndefined } from "../language.js";

const EmptyObj = create(null);

function observeAttributes(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }
    const { def: { observedAttrs } } = vm;
    if (observedAttrs.length === 0) {
        return; // nothing to observe
    }

    let { data: { attrs: oldAttrs } } = oldVnode;
    let { data: { attrs: newAttrs } } = vnode;

    // infuse key-value pairs from _props into the component
    if (oldAttrs !== newAttrs && (oldAttrs || newAttrs)) {

        let key: string, cur: any;
        oldAttrs = oldAttrs || EmptyObj;
        newAttrs = newAttrs || EmptyObj;
        // removed props should be reset in component's props
        for (key in oldAttrs) {
            if (key in observedAttrs && !(key in newAttrs)) {
                invokeComponentAttributeChangedCallback(vm, key, oldAttrs[key], null);
            }
        }

        // new or different props should be set in component's props
        for (key in newAttrs) {
            if (key in observedAttrs) {
                cur = newAttrs[key];
                if (!(key in oldAttrs) || oldAttrs[key] != cur) {
                    invokeComponentAttributeChangedCallback(vm, key, oldAttrs[key], cur);
                }
            }
        }
    }
}

export default {
    create: observeAttributes,
    update: observeAttributes,
};
