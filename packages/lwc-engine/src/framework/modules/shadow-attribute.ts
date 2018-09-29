import { isUndefined } from "lwc-engine/src/shared/language";
import { Module, VNode } from "lwc-engine/src/3rdparty/snabbdom/types";
import { removeAttribute, setAttribute } from "lwc-engine/src/framework/dom-api";

function updateToken(oldVnode: VNode, vnode: VNode) {
    const { shadowAttribute: oldAttribute } = oldVnode.data;
    const { shadowAttribute: newAttribute } = vnode.data;

    if (oldAttribute === newAttribute) {
        return;
    }

    const elm = vnode.elm as Element;
    if (!isUndefined(oldAttribute)) {
        removeAttribute.call(elm, oldAttribute);
    }

    if (!isUndefined(newAttribute)) {
        setAttribute.call(elm, newAttribute, '');
    }
}

const tokenModule: Module = {
    create: updateToken,
    update: updateToken,
};

export default tokenModule;
