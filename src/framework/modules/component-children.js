import assert from "../assert.js";
import { rehydrate } from "../vm.js";
import { renderComponent } from "../component.js";

function rerender(oldVnode: VNode, vnode: VNode) {
    const { vm } = vnode;
    if (!vm) {
        return;
    }
    const { children } = vnode;
    // if diffing against an empty element, it means vnode was created and
    // has never been rendered. an immidiate rehydration is
    // needed otherwise the children are not going to be populated.
    if (oldVnode.sel === '') {
        assert.invariant(vm.isDirty, `${vnode} should be dirty after creation`);
        assert.invariant(vm.fragment === undefined, `${vnode} should not have a fragment after creation`);
        rehydrate(vm);
        // avoiding the rest of this diffing entirely because it happens already in rehydrate
        const { children: oldCh } = oldVnode;
        oldCh.splice(0, oldCh.length).push.apply(oldCh, vm.fragment);
        // TODO: this is a fork of the fiber since the create hook is called during a
        // patching process. How can we optimize this to reuse the same queue?
        // and idea is to do this part in the next turn (a la fiber)
        // PR https://github.com/snabbdom/snabbdom/pull/234 might help.
    } else if (vm.isDirty) {
        assert.invariant(oldVnode.children !== children, `If component is dirty, the children collections must be different. In theory this should never happen.`);
        renderComponent(vm);
    }
    // replacing the vnodes in the children array without replacing the array itself
    // because the engine has a hard reference to the original array object.
    children.splice(0, children.length).push.apply(children, vm.fragment);
}

export default {
    create: rerender,
    update: rerender,
};
