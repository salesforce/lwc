import assert from "./assert";
import { clearListeners } from "./component";
import { rehydrate, addInsertionIndex, removeInsertionIndex, patchShadowRoot } from "./vm";

export function insert(vnode: ComponentVNode) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vnode(vnode);
        assert.vm(vnode.vm);
        if (vnode.vm.idx > 0) {
            assert.isTrue(vnode.isRoot, `${vnode.vm} is already inserted.`);
        }
    }
    const { vm } = vnode;
    if (vm.idx > 0) {
        destroy(vnode); // moving the element from one place to another is observable via life-cycle hooks
    }
    addInsertionIndex(vm);
    if (vm.isDirty) {
        // this code path guarantess that when patching the custom element for the first time,
        // the body is computed only after the element is in the DOM, otherwise the hooks
        // for any children's vnode are not going to be useful.
        rehydrate(vm);
    }
}

export function update(oldVnode: ComponentVNode, vnode: ComponentVNode) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vnode(vnode);
        assert.vm(vnode.vm);
    }
    const { vm } = vnode;

    // TODO: we don't really need this block anymore, but it will require changes
    // on many tests that are just patching the element directly.
    if (vm.idx === 0 && !vnode.isRoot) {
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
    if (vm.isDirty) {
        // this code path guarantess that when patching the custom element the body is computed only after the element is in the DOM
        rehydrate(vm);
    }
}

export function destroy(vnode: ComponentVNode) {
    if (process.env.NODE_ENV !== 'production') {
        assert.vnode(vnode);
        assert.vm(vnode.vm);
        assert.isTrue(vnode.vm.idx, `${vnode.vm} is not inserted.`);
    }
    const { vm } = vnode;
    removeInsertionIndex(vm);
    // just in case it comes back, with this we guarantee re-rendering it
    vm.isDirty = true;
    clearListeners(vm);
    // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use realm custom elements, we can remove this.
    patchShadowRoot(vm, []);
}

export const lifeCycleHooks = {
    insert,
    update,
    destroy,
}
