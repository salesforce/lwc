import { isUndefined } from "../language";
import { Module, VNode } from "../../3rdparty/snabbdom/types";
import { removeAttribute, setAttribute } from "../dom-api";

function updateToken(oldVnode: VNode, vnode: VNode) {
    const { data: { token: oldToken } } = oldVnode;
    const { data: { token: newToken } } = vnode;

    if (oldToken === newToken) {
        return;
    }

    const elm = vnode.elm as Element;
    if (!isUndefined(oldToken)) {
        removeAttribute.call(elm, oldToken);
    }

    if (!isUndefined(newToken)) {
        setAttribute.call(elm, newToken, '');
    }
}

const tokenModule: Module = {
    create: updateToken,
    update: updateToken,
};

export default tokenModule;
