import { createVM, setLinkedVNode } from "../vm.js";
import assert from "../assert.js";

// this hook will set up the component instance associated to the new vnode,
// and link the new vnode with the corresponding component
function initializeComponent(oldVnode: ComponentVNode, vnode: ComponentVNode) {
    const { Ctor } = vnode;
    if (!Ctor) {
        return;
    }
    /**
     * The reason why we do the initialization here instead of prepatch or any other hook
     * is because the creation of the component does require the element to be available.
     */
    assert.invariant(vnode.elm, `${vnode}.elm should be ready.`);
    const { vm } = oldVnode;
    if (vm && oldVnode.Ctor === Ctor) {
        vnode.vm = vm;
        setLinkedVNode(vm.component, vnode);
    } else {
        createVM(vnode);
        console.log(`Component for ${vnode.vm} was created.`);
    }
    assert.invariant(vnode.vm.component, `vm ${vnode.vm} should have a component and element associated to it.`);
}

export default {
    create: initializeComponent,
    update: initializeComponent,
};
