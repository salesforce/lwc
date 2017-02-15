import assert from "./assert.js";
import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";
import { clearListeners } from "./component.js";

export const globalRenderedCallbacks: Array<() => void> = [];

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
    post() {
        // This hook allows us to resolve a promise after the current patching
        // process has concluded and all elements are in the DOM.
        // TODO: we don't have that user-land API just yet, but eventually we will
        // have it to support something like `element.focus()`;
        const len = globalRenderedCallbacks.length;
        for (let i = 0; i < len; i += 1) {
            const callback = globalRenderedCallbacks.shift();
            // TODO: do we need to set and restore context around this callback?
            callback();
        }
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
