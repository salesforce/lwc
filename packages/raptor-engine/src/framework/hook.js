import assert from "./assert.js";
import {
    invokeComponentConnectedCallback,
    invokeComponentDisconnectedCallback,
} from "./invoker.js";
import { clearListeners } from "./component.js";
import { rehydrate } from "./vm.js";
import { addCallbackToNextTick } from "./utils.js";
import { ArrayPush } from "./language.js";
import { invokeServiceHook, services } from "./services.js";

function insert(vnode: ComponentVNode) {
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
        children.length = 0;
        ArrayPush.apply(children, vm.fragment);
    }
    const { connected } = services;
    if (connected) {
        addCallbackToNextTick((): void => invokeServiceHook(vm, connected));
    }
    if (vm.component.connectedCallback) {
        addCallbackToNextTick((): void => invokeComponentConnectedCallback(vm));
    }
    console.log(`"${vm}" was inserted.`);
}

function destroy(vnode: ComponentVNode) {
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
    assert.isTrue(vm.wasInserted, `${vm} is not inserted.`);
    vm.wasInserted = false;
    const { disconnected } = services;
    if (disconnected) {
        addCallbackToNextTick((): void => invokeServiceHook(vm, disconnected));
    }
    if (vm.component.disconnectedCallback) {
        addCallbackToNextTick((): void => invokeComponentDisconnectedCallback(vm));
    }
    clearListeners(vm);
    console.log(`"${vm}" was destroyed.`);
}

function postpatch(oldVnode: VNode, vnode: ComponentVNode) {
    assert.vnode(vnode);
    assert.vm(vnode.vm);
    if (vnode.vm.wasInserted === false) {
        // when inserting a root element, or when reusing a DOM element for a new
        // component instance, the insert() hook is never called because the element
        // was already in the DOM before creating the instance, and diffing the
        // vnode, for that, we wait until the patching process has finished, and we
        // use the postpatch() hook to trigger the connectedCallback logic.
        insert(vnode);
        // Note: we don't have to worry about destroy() hook being called before this
        // one because they never happen in the same patching mechanism, only one
        // of them is called. In the case of the insert() hook, we use the `wasInserted`
        // flag to dedupe the calls since they both can happen in the same patching process.
    }
}

export const lifeCycleHooks = {
    insert,
    destroy,
    postpatch,
}
