import { isUndefined } from "../language.js";
import { EmptyObject } from "../utils.js";

function syncClassNames(oldVnode: VNode, vnode: ComponentVNode) {
    const { vm } = vnode;
    if (isUndefined(vm)) {
        return;
    }

    const { vm: oldVm } = oldVnode;
    if (oldVm === vm) {
        return;
    }

    const oldClass = (oldVm && oldVm.cmpClasses) || EmptyObject;
    const { cmpClasses: klass = EmptyObject } = vm;

    if (oldClass === klass) {
        return;
    }

    const { elm, data: { class: ownerClass = EmptyObject } } = vnode;

    let name: string;
    for (name in oldClass) {
        // remove only if it was removed from within the instance and it is not set from owner
        if (oldClass[name] && !klass[name] && !ownerClass[name]) {
            elm.classList.remove(name);
        }
    }
    for (name in klass) {
        if (klass[name] && !oldClass[name]) {
            elm.classList.add(name);
        }
    }
}

export default {
    create: syncClassNames,
    update: syncClassNames,
};
