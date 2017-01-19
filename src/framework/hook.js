import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";
import assert from "./assert.js";
import {
    destroyComponent,
} from "./component.js";

export const hook = {
    postpatch(oldvm: VM, vm: VM) {
        if (vm.Ctor) {
            assert.vm(vm);
            const { sel, elm, data, children, text } = vm;
            vm.cache.prevNode = { sel, elm, data, children: [children[0]], text };
        }
        console.log(`vnode "${vm}" was patched.`);
    },
    insert(vm: VM) {
        assert.vm(vm);
        if (vm.cache.component.connectedCallback) {
            invokeComponentConnectedCallback(vm);
        }
        console.log(`vnode "${vm}" was inserted.`);
    },
    destroy(vm: VM) {
        assert.vm(vm);
        if (vm.cache.component.disconnectedCallback) {
            invokeComponentDisconnectedCallback(vm);
        }
        if (vm.cache.listeners.size > 0) {
            destroyComponent(vm);
        }
        console.log(`vnode "${vm}" was destroyed.`);
    },
}
