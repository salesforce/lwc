import assert from "../assert.js";
import { renderComponent } from "../component.js";
import { patch } from "../patcher.js";

function foldVnode(receiverNode: VM, providerNode: VNode) {
    assert.vm(receiverNode);
    const { children, text, data } = providerNode;
    const { data: { hook } } = receiverNode;
    assert.isTrue(providerNode.sel === receiverNode.sel, `The selector of the child vnode ${providerNode} must always match ${receiverNode.sel}`);
    receiverNode.children = children;
    receiverNode.text = text;
    receiverNode.data = { hook };
    Object.setPrototypeOf(receiverNode.data, data);
}

function update(oldVnode: VNode, vnode: VNode) {
    const { cache, hasElement } = vnode;
    if (!cache || hasElement) {
        return;
    }
    let { shadowRoot } = cache;
    if (cache.isDirty) {
        const { elm } = vnode;
        const childNode = renderComponent(vnode);
        // we need to force patching here to guarantee that the children
        // of the shadowRoot node is computed ahead of the folding process.
        patch(shadowRoot || elm, childNode);
        cache.shadowRoot = shadowRoot = childNode;
        cache.isScheduled = false;
    }
    // invalidating any succesive patching from this point on...
    oldVnode.data = vnode.data;
    // invaliding children diffing from this point on...
    assert.isTrue(Array.isArray(oldVnode.children), 'The old vm should always have a children collection.');
    oldVnode.children.splice(0, -1);
    assert.isTrue(Array.isArray(vnode.children), 'The new vm should always have a children collection.');
    vnode.children.splice(0, -1);
}

export default {
    create: update,
    update,
};
