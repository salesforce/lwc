import assert from "../assert.js";
import { rehydrate } from "../hook.js";
import { renderComponent } from "../component.js";

function rerender(oldVnode: VNode, vnode: VM) {
    const { cache } = vnode;
    if (!cache) {
        return;
    }
    const { children } = vnode;
    // if diffing against an empty element, it means vnode was created and
    // has never been rendered. an immidiate rehydration is
    // needed otherwise the children are not going to be populated.
    if (oldVnode.sel === '') {
        assert.invariant(cache.isDirty, `${vnode} should be dirty after creation`);
        assert.invariant(cache.fragment === undefined, `${vnode} should not have a fragment after creation`);
        rehydrate(vnode);
        // avoiding the rest of this diffing entirely because it happens already in rehydrate
        const { children: oldCh } = oldVnode;
        oldCh.splice(0, oldCh.length).push.apply(oldCh, cache.fragment);
        // TODO: this is a fork of the fiber since the create hook is called during a
        // patching process. How can we optimize this to reuse the same queue?
        // and idea is to do this part in the next turn (a la fiber)
        // PR https://github.com/snabbdom/snabbdom/pull/234 might help.
    } else if (cache.isDirty) {
        assert.invariant(oldVnode.children !== children, `If component is dirty, the children collections must be different. In theory this should never happen.`);
        renderComponent(vnode);
    }
    // replacing the vnodes in the children array without replacing the array itself
    // because the engine has a hard reference to the original array object.
    children.splice(0, children.length).push.apply(children, cache.fragment);
}

export default {
    create: rerender,
    update: rerender,
};
