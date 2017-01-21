function updatePropsFromState(oldVnode: vnode, vnode: VM) {
    const { cache } = vnode;
    if (!cache) {
        return;
    }

    const oldProps = oldVnode.data.props || {};
    // at this point, props are irrelevant because component-state.js have consolidated
    // them into state, and what matters is the `state` vs `oldProps`
    const { elm } = vnode;
    const { state, component, def: { props: config } } = cache;
    let key: string, cur: any, old: any, v: any;

    for (key in oldProps) {
        if (!(key in state)) {
            delete elm[key];
        }
    }
    for (key in state) {
        cur = state[key];
        old = oldProps[key];
        if (old !== cur) {
            // for component derivated props, the prop should reflect the value
            // accessible from within the component instance. for arbitrary
            // passed using the side-channels, use the original value from state
            v = config[key] ? component[key] : state[key];
            if (elm[key] != v) {
                elm[key] = v;
            }
        }
    }
}

export default {
    create: updatePropsFromState,
    update: updatePropsFromState,
};
