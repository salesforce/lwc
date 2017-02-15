function syncClassNames(oldVnode: vnode, vnode: VM) {
    const { cache } = vnode;
    if (!cache) {
        return;
    }

    let { data: { _class: oldClass } } = oldVnode;
    let { data: { _class: klass } } = vnode;
    const { component: { classList } } = cache;

    // propagating changes from "data->_class" into component's classList
    if (klass !== oldClass) {
        oldClass = (oldClass || '').split(' ');
        klass = (klass || '').split(' ');

        for (let i = 0; i < oldClass.length; i += 1) {
            const className = oldClass[i];
            if (classList.contains(className)) {
                classList.remove(className);
            }
        }
        for (let i = 0; i < klass.length; i += 1) {
            const className = klass[i];
            if (!classList.contains(className)) {
                classList.add(className);
            }
        }
    }
}

export default {
    create: syncClassNames,
    update: syncClassNames,
};
