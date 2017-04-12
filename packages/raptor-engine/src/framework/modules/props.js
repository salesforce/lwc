import assert from "../assert.js";
import { isUndefined } from "../language.js";
import { EmptyObject } from "../utils.js";

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
            if (vnode.isRoot) {
                // custom elements created programatically prevent you from
                // deleting the property because it has a set/get to update
                // the corresponding component, in this case, we just set it
                // to undefined, which has the same effect.
                elm[key] = undefined;
            } else {
                delete elm[key];
            }
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (old !== cur) {
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                // only touching the dom if the prop really changes.
                assert.block(function devModeCheck() {
                    if (elm[key] === cur && old !== undefined && !vnode.isRoot) {
                        console.warn(`unneccessary update of property "${key}" in ${elm}, it has the same value in ${vnode.vm || vnode}.`);
                    }
                });
                elm[key] = cur;
            }
        }
    }
}

export default {
    create: update,
    update,
};
