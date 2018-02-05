import assert from "../assert";
import { EmptyObject } from "../utils";
import { isUndefined } from "../language";
import { Module, VNode } from "../../3rdparty/snabbdom/types";

function updateClass(oldVnode: VNode, vnode: VNode) {
    const { elm, data: { class: klass } } = vnode;
    if (isUndefined(klass)) {
        return;
    }
    let { data: { class: oldClass } } = oldVnode;
    if (oldClass === klass) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldClass) || typeof oldClass === typeof klass, `vnode.data.class cannot change types.`);
    }

    const { classList } = (elm as Element);
    let name: string;
    oldClass = isUndefined(oldClass) ? EmptyObject : oldClass;

    for (name in (oldClass as any)) {
        // remove only if it is not in the new class collection and it is not set from within the instance
        if (isUndefined(klass[name])) {
            classList.remove(name);
        }
    }
    for (name in klass) {
        if (isUndefined((oldClass as any)[name])) {
            classList.add(name);
        }
    }
}

export default {
    create: updateClass,
    update: updateClass
};
