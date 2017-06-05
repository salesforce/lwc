import assert from "./assert";
import { invokeComponentMethod } from "./invoker";
import { clearListeners } from "./component";
import { rehydrate, addInsertionIndex, removeInsertionIndex } from "./vm";
import { addCallbackToNextTick, noop } from "./utils";
import { invokeServiceHook, services } from "./services";

function insert(vnode: ComponentVNode) {
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
    assert.isFalse(vm.idx, `${vm} is already inserted.`);
    addInsertionIndex(vm);
    const { isDirty, component: { connectedCallback } } = vm;
    if (isDirty) {
        // this code path guarantess that when patching the custom element for the first time,
        // the body is computed only after the element is in the DOM, otherwise the hooks
        // for any children's vnode are not going to be useful.
        rehydrate(vm);
    }
    const { connected } = services;
    if (connected) {
        addCallbackToNextTick((): void => invokeServiceHook(vm, connected));
    }
    if (connectedCallback && connectedCallback !== noop) {
        addCallbackToNextTick((): void => invokeComponentMethod(vm, 'connectedCallback'));
    }
    console.log(`"${vm}" was inserted.`);
}

function destroy(vnode: ComponentVNode) {
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
    assert.isTrue(vm.idx, `${vm} is not inserted.`);
    removeInsertionIndex(vm);
    // just in case it comes back, with this we guarantee re-rendering it
    vm.isDirty = true;
    const { disconnected } = services;
    const { component: { disconnectedCallback } } = vm;
    clearListeners(vm);
    if (disconnected) {
        addCallbackToNextTick((): void => invokeServiceHook(vm, disconnected));
    }
    if (disconnectedCallback && disconnectedCallback !== noop) {
        addCallbackToNextTick((): void => invokeComponentMethod(vm, 'disconnectedCallback'));
    }
    console.log(`"${vm}" was destroyed.`);
}

function postpatch(oldVnode: VNode, vnode: ComponentVNode) {
    assert.vnode(vnode);
    assert.vm(vnode.vm);
    if (vnode.vm.idx === 0) {
        // when inserting a root element, or when reusing a DOM element for a new
        // component instance, the insert() hook is never called because the element
        // was already in the DOM before creating the instance, and diffing the
        // vnode, for that, we wait until the patching process has finished, and we
        // use the postpatch() hook to trigger the connectedCallback logic.
        insert(vnode);
        // Note: we don't have to worry about destroy() hook being called before this
        // one because they never happen in the same patching mechanism, only one
        // of them is called. In the case of the insert() hook, we use the value of `idx`
        // to dedupe the calls since they both can happen in the same patching process.
    }
}

export const lifeCycleHooks = {
    insert,
    destroy,
    postpatch,
}
