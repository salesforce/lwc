function updateProps(oldVnode: vnode, vnode: VM) {
    const { cache } = vnode;
    if (!cache) {
        return;
    }

    const oldProps = oldVnode.data.props || {};
    // at this point, props are irrelevant because component-state.js have consolidated
    // them into _props, and what matters is the `_props` vs `oldProps`
    const { data: { _props }, elm } = vnode;
    const { component, def: { props: publicPropsConfig } } = cache;
    let key: string, cur: any, old: any;

    for (key in oldProps) {
        if (!_props[key]) {
            delete elm[key];
        }
    }
    for (key in _props) {
        cur = _props[key];
        old = oldProps[key];
        if (old !== cur) {
            // for component derivated props (reflective props), the DOM should reflect the value
            // accessible from within the component instance. for props that were arbitrary
            // passed using the side-channels (setAttribute, className, etc.), use the original
            // value from _props.
            // TODO: maybe we can just expose the raw value everytime for perf reasons
            elm[key] = publicPropsConfig[key] ? component[key] : _props[key];
        }
    }
}

export default {
    create: updateProps,
    update: updateProps,
};
