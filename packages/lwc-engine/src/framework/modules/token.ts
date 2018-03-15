import { isUndefined } from "../language";
import { prepareForAttributeMutationFromTemplate } from '../def';
import { Module, VNode } from "../../3rdparty/snabbdom/types";
import { removeAttribute, setAttribute } from "../dom";

function updateToken(oldVnode: VNode, vnode: VNode) {
    const { data: { token: oldToken } } = oldVnode;
    const { data: { token: newToken } } = vnode;

    if (oldToken === newToken) {
        return;
    }

    const elm = vnode.elm as Element;
    if (!isUndefined(oldToken)) {
        if (process.env.NODE_ENV !== 'production') {
            prepareForAttributeMutationFromTemplate(elm, oldToken);
        }
        removeAttribute.call(elm, oldToken);
    }

    if (!isUndefined(newToken)) {
        if (process.env.NODE_ENV !== 'production') {
            prepareForAttributeMutationFromTemplate(elm, newToken);
        }
        setAttribute.call(elm, newToken, '');
    }
}

const tokenModule: Module = {
    create: updateToken,
    update: updateToken,
};

export default tokenModule;
