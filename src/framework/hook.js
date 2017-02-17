import assert from "./assert.js";
import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";
import { clearListeners } from "./component.js";

export const lifeCycleHooks = {
    insert(vnode: ComponentVNode) {
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        if (vm.component.connectedCallback) {
            invokeComponentConnectedCallback(vm);
        }
        console.log(`"${vm}" was inserted.`);
    },
    destroy(vnode: ComponentVNode) {
        assert.vnode(vnode);
        const { vm } = vnode;
        assert.vm(vm);
        if (vm.component.disconnectedCallback) {
            invokeComponentDisconnectedCallback(vm);
        }
        if (vm.listeners.size > 0) {
            clearListeners(vm);
        }
        console.log(`"${vm}" was destroyed.`);
    },
}
