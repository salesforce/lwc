import { createVM, relinkVM } from "../vm";
import assert from "../assert";
import { isUndefined } from "../language";

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode: ComponentVNode, vnode: ComponentVNode) {
    const { Ctor } = vnode;
    if (isUndefined(Ctor)) {
        return;
    }
    /**
     * The reason why we do the initialization here instead of prepatch or any other hook
     * is because the creation of the component does require the element to be available.
     */
    assert.invariant(vnode.elm, `${vnode}.elm should be ready.`);
    if (oldVnode.vm && oldVnode.Ctor === Ctor) {
        assert.invariant(vnode.elm === oldVnode.elm, `${vnode}.elm should always match the oldVnode's   element.`);
        relinkVM(oldVnode.vm, vnode);
    } else {
        createVM(vnode);
    }
    assert.invariant(vnode.vm.component, `vm ${vnode.vm} should have a component and element associated to it.`);
}

export default {
    create: initializeComponent,
    update: initializeComponent,
};
