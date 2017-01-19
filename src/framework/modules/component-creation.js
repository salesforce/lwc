import { createComponent } from "../component.js";
import { linkComponentToVM } from "../html-element.js";
import assert from "../assert.js";

function create(oldVnode: VNode, vnode: VNode) {
    const { Ctor } = vnode;
    if (!Ctor) {
        return;
    }
    assert.vm(vnode);
    if (!vnode.cache) {
        if (oldVnode.Ctor === Ctor && oldVnode.cache) {
            Object.setPrototypeOf(vnode, Object.getPrototypeOf(oldVnode));
        } else {
            createComponent(vnode);
            console.log(`Component for ${vnode} was created.`);
        }
    }
    assert.invariant(vnode.cache.component, `vm ${vnode} should have a component and element associated to it.`);
    linkComponentToVM(vnode.cache.component, vnode);
}

export default {
    create,
    update: create,
};
