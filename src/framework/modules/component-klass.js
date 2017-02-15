function syncClassNames(oldVnode: vnode, vnode: VNode) {
    const { vm } = vnode;
    if (!vm) {
        return;
    }

    let { data: { _class: oldClass } } = oldVnode;
    let { data: { _class: klass } } = vnode;
    let { component: { classList } } = vm;

    // if component's classList is not defined (it is only defined for
    // components extending HTMLElement), we need to fallback
    if (!classList) {
        classList = vnode.elm.classList;
    }

    // propagating changes from "data->_class" into classList
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
