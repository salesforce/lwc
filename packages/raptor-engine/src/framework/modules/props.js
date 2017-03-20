import assert from "../assert.js";
import { create } from "../language.js";

const EmptyObj = create(null);

// TODO: eventually use the one shipped by snabbdom directly
function update(oldVnode: VNode, vnode: VNode) {
    let oldProps = oldVnode.data.props;
    let props = vnode.data.props;

    if (!oldProps && !props) {
        return;
    }
    if (oldProps === props) {
        return;
    }

    oldProps = oldProps || EmptyObj;
    props = props || EmptyObj;

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
                assert.block(() => {
                    if (elm[key] === cur && old !== undefined && !vnode.isRoot) {
                        console.warn(`unneccessary update of element <${vnode.sel}>, property "${key}" for ${vnode.vm || vnode.sel}.`);
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
