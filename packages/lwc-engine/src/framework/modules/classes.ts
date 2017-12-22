import { EmptyObject } from "../utils";

function updateClass(oldVnode: VNode, vnode: VNode) {
    const { data: { class: oldClass = EmptyObject } } = oldVnode;
    const { elm, data: { class: klass = EmptyObject } } = vnode;

    if (oldClass === klass) {
        return;
    }

    const { classList } = elm;
    let name: string
    for (name in oldClass) {
        // remove only if it is not in the new class collection and it is not set from within the instance
        if (!klass[name]) {
            classList.remove(name);
        }
    }
    for (name in klass) {
        if (!oldClass[name]) {
            classList.add(name);
        }
    }
}

export default {
    create: updateClass,
    update: updateClass
};
