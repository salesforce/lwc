function updateClass (oldVnode: VNode, vnode: VNode) {
    const elm = vnode.elm;
    const oldClass = oldVnode.data.class;
    const klass = vnode.data.class;

    if (!oldClass && !klass) {
        return;
    }

    if (klass !== oldClass) {
        elm.className = klass;
    }
}

export default {
    create: updateClass,
    update: updateClass
}
