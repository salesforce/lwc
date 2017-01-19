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

    let key: string, cur: any, old: any, v: any;
    const { elm, cache } = vnode;
    const component = cache && cache.component;

    for (key in oldProps) {
        if (key in props) {
            delete elm[key];
        }
    }
    for (key in props) {
        cur = props[key];
        old = oldProps[key];

        if (old !== cur) {
            if (component) {
                // for component derivated props, the prop should reflect the value
                // accessible from within the component instance.
                v = component[key];
                if (elm[key] != v) {
                    elm[key] = v;
                }
            } else if (key !== 'value' || elm[key] !== cur) {
                // only touching the dom if the prop really changes.
                elm[key] = cur;
            }
        }
    }
}

export default {
    create: update,
    update,
};
