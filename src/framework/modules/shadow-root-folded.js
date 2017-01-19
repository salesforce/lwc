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
    const { children = [] } = shadowRoot;
    const { children: oldChildren = [] } = oldVnode;
    for (let i = 0; i < children.length; i += 1) {
        oldChildren[i] = children[i];
    }
    while (children.length < oldChildren.length) {
        oldChildren.pop();
    }
}

export default {
    create: update,
    update,
};
