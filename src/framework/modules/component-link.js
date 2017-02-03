import { createComponent } from "../component.js";
import { linkComponentToVM } from "../html-element.js";
import assert from "../assert.js";
import {
    setPrototypeOf,
    getPrototypeOf,
} from "../language.js";

function link(oldVnode: VM, vnode: VM) {
    const { Ctor } = vnode;
    if (!Ctor) {
        return;
    }
    // TODO: extension point for locker to add or remove identity to each DOM element.
    assert.vm(vnode);
    assert.invariant(vnode.elm, `${vnode}.elm should be ready.`);
    if (!vnode.cache) {
        if (oldVnode.Ctor === Ctor && oldVnode.cache) {
            assert.block(() => {
                setPrototypeOf(vnode, getPrototypeOf(oldVnode));
            });
            vnode.cache = oldVnode.cache;
            vnode.data._props = oldVnode.data._props;
            vnode.data._on = oldVnode.data._on;
        } else {
            createComponent(vnode);
            console.log(`Component for ${vnode} was created.`);
        }
    }
    assert.invariant(vnode.cache.component, `vm ${vnode} should have a component and element associated to it.`);
    linkComponentToVM(vnode.cache.component, vnode);
}

export default {
    create: link,
    update: link,
};
