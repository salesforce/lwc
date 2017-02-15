import { createComponent, setLinkedVNode } from "../component.js";
import assert from "../assert.js";
import {
    setPrototypeOf,
    getPrototypeOf,
} from "../language.js";

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode: VNode, vnode: VM) {
    const { Ctor, cache } = vnode;
    if (!Ctor || cache) {
        return;
    }
    assert.vm(vnode);
    /**
     * The reason why we do the initialization here instead of prepatch or any other hook
     * is because the creation of the component does require the element to be available.
     */
    assert.invariant(vnode.elm, `${vnode}.elm should be ready.`);
    if (oldVnode.Ctor === Ctor && oldVnode.cache) {
        assert.block(() => {
            setPrototypeOf(vnode, getPrototypeOf(oldVnode));
        });
        vnode.cache = oldVnode.cache;
    } else {
        createComponent(vnode);
        console.log(`Component for ${vnode} was created.`);
    }
    assert.invariant(vnode.cache.component, `vm ${vnode} should have a component and element associated to it.`);
    // TODO: extension point for locker to add or remove identity to each DOM element.
    setLinkedVNode(vnode.cache.component, vnode);
}

export default {
    create: initializeComponent,
    update: initializeComponent,
};
