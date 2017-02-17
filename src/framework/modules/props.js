import assert from "../assert.js";

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

    oldProps = oldProps || {};
    props = props || {};

    let key: string, cur: any, old: any;
    const { elm } = vnode;

    for (key in oldProps) {
        if (!props[key]) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (old !== cur) {
            if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
                // only touching the dom if the prop really changes.
                assert.block(() => {
                    if (elm[key] === cur) {
                        console.warn(`unneccessary update of element ${elm}, property ${key} for ${vnode}.`);
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
