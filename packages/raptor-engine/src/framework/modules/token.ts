import { isUndefined } from "../language";

function updateToken(oldVnode: VNode, vnode: VNode) {
    const { data: { token: oldToken } } = oldVnode;
    const { data: { token: newToken }, elm } = vnode;

    if (oldToken === newToken) {
        return;
    }

    if (!isUndefined(oldToken)) {
        elm!.removeAttribute(oldToken);
    }

    if (!isUndefined(newToken)) {
        elm!.setAttribute(newToken, '');
    }
}

const tokenModule: Module = {
    create: updateToken,
    update: updateToken,
};

export default tokenModule;
