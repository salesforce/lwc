import assert from "../assert";
import { isUndefined } from "../language";
import { EmptyObject } from "../utils";

// TODO: eventually use the one shipped by snabbdom directly
function update(oldVnode: VNode, vnode: VNode) {
    let oldProps = oldVnode.data.props;
    let props = vnode.data.props;

    if (isUndefined(oldProps) && isUndefined(props)) {
        return;
    }
    if (oldProps === props) {
        return;
    }

    oldProps = oldProps || EmptyObject;
    props = props || EmptyObject;

    let key: string, cur: any, old: any;
    const { elm } = vnode;

    for (key in oldProps) {
        if (!(key in props)) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (old !== cur) {
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                // only touching the dom if the prop really changes.
                if (process.env.NODE_ENV !== 'production') {
                    if (elm[key] === cur && old !== undefined) {
                        console.warn(`Unneccessary update of property "${key}" in ${elm}, it has the same value in ${vnode.vm || vnode}.`);
                    }
                }
                elm[key] = cur;
            }
        }
    }
}

export default {
    create: update,
    update,
};
