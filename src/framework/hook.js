import assert from "./assert.js";
import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";
import { clearListeners } from "./component.js";
import { rehydrate } from "./vm.js";

export const lifeCycleHooks = {
    insert(vnode: ComponentVNode) {
        assert.vnode(vnode);
        const { vm, children } = vnode;
        assert.vm(vm);
        assert.isFalse(vm.wasInserted, `${vm} is already inserted.`);
        vm.wasInserted = true;
        if (vm.isDirty) {
            // this code path guarantess that when patching the custom element for the first time,
            // the body is computed only after the element is in the DOM, otherwise the hooks
            // for any children's vnode are not going to be useful.
            rehydrate(vm);
            // replacing the vnode's children collection so successive patching routines
            // will diff against the full tree, not a only partial one.
            children.splice(0, children.length).push.apply(children, vm.fragment);
        }
        if (vm.component.connectedCallback) {
            invokeComponentConnectedCallback(vm);
        }
        console.log(`"${vm}" was inserted.`);
    },
    destroy(vnode: ComponentVNode) {
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        assert.isTrue(vm.wasInserted, `${vm} is not inserted.`);
        vm.wasInserted = false;
        if (vm.component.disconnectedCallback) {
            invokeComponentDisconnectedCallback(vm);
        }
        if (vm.listeners.size > 0) {
            clearListeners(vm);
        }
        console.log(`"${vm}" was destroyed.`);
    },
}
