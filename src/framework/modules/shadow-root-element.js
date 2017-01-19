import assert from "../assert.js";
import {
    renderComponent,
} from "../component.js";

function update(oldVnode: VNode, vnode: VNode) {
    const { cache, hasElement } = vnode;
    if (!cache || !hasElement) {
        return;
    }

    let { shadowRoot } = cache;
    if (cache.isDirty) {
        shadowRoot = renderComponent(vnode);
        cache.shadowRoot = shadowRoot;
    }
    assert.invariant(shadowRoot, 'Render should always return a vnode instead of ${shadowRoot}');
    vnode.children[0] = shadowRoot;
}

export default {
    create: update,
    update,
};
