import { isUndefined } from "../language";
import { prepareForAttributeMutationFromTemplate } from '../def';

function updateToken(oldVnode: VNode, vnode: VNode) {
    const { data: { token: oldToken } } = oldVnode;
    const { data: { token: newToken }, elm } = vnode;

    if (oldToken === newToken) {
        return;
    }

    if (!isUndefined(oldToken)) {
        if (process.env.NODE_ENV !== 'production') {
            prepareForAttributeMutationFromTemplate(elm, oldToken);
        }
        elm!.removeAttribute(oldToken);
    }

    if (!isUndefined(newToken)) {
        if (process.env.NODE_ENV !== 'production') {
            prepareForAttributeMutationFromTemplate(elm, newToken);
        }
        elm!.setAttribute(newToken, '');
    }
}

const tokenModule: Module = {
    create: updateToken,
    update: updateToken,
};

export default tokenModule;
