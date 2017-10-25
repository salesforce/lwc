import assert from "./assert";
import { patch } from "./patch";
import { c } from "./api";
import { isUndefined, isFunction, assign } from "./language";
import { insert } from "./hook";
import { removeInsertionIndex, patchShadowRoot } from "./vm";
import { clearListeners } from "./component";

const { removeChild, appendChild, insertBefore, replaceChild } = Node.prototype;
const ConnectingSlot = Symbol();
const DisconnectingSlot = Symbol();

function callNodeSlot(node: Node, slot: symbol): Node {
    assert.isTrue(node, `callNodeSlot() should not be called for a non-object`);
    if (!isUndefined(node[slot])) {
        node[slot]();
    }
    return node; // for convenience
}

// monkey patching Node methods to be able to detect the insertions and removal of
// root elements created via createElement.
assign(Node.prototype, {
    appendChild(newChild: Node): Node {
        const appendedNode = appendChild.call(this, newChild);
        return callNodeSlot(appendedNode, ConnectingSlot);
    },
    insertBefore(newChild: Node, referenceNode: Node): Node {
        const insertedNode = insertBefore.call(this, newChild, referenceNode);
        return callNodeSlot(insertedNode, ConnectingSlot);
    },
    removeChild(oldChild: Node): Node {
        const removedNode = removeChild.call(this, oldChild);
        return callNodeSlot(removedNode, DisconnectingSlot);
    },
    replaceChild(newChild: Node, oldChild: Node): Node {
        const replacedNode = replaceChild.call(this, newChild, oldChild);
        callNodeSlot(replacedNode, DisconnectingSlot);
        callNodeSlot(newChild, ConnectingSlot);
        return replacedNode;
    }
});

// this could happen for two reasons:
// * it is a root, and was removed manually
// * the element was appended to another container which requires disconnection to happen first
function forceDisconnection(vnode: ComponentVNode) {
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
    vm.isDirty = true;
    removeInsertionIndex(vm);
    clearListeners(vm);
    // At this point we need to force the removal of all children because
    // we don't have a way to know that children custom element were removed
    // from the DOM. Once we move to use realm custom elements, we can remove this.
    patchShadowRoot(vm, []);
}

/**
 * This method is almost identical to document.createElement
 * (https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement)
 * with the slightly difference that in the options, you can pass the `is`
 * property set to a Constructor instead of just a string value. E.g.:
 *
 * const el = createElement('x-foo', { is: FooCtor });
 *
 * If the value of `is` attribute is not a constructor,
 * then we fallback to the normal Web-Components workflow.
 */
export function createElement(tagName: string, options: any = {}): HTMLElement {
    const Ctor = isFunction(options.is) ? options.is : null;
    let vnode: VNode | undefined = undefined;
    // If we have a Ctor, create our VNode
    if (Ctor) {
        vnode = c(tagName, Ctor, {});
        vnode.isRoot = true;
        // If Ctor defines forceTagName
        // vnode.sel will be the tagname we should use
        tagName = vnode.sel as string;
    }

    // Create element with correct tagName
    const element = document.createElement(tagName);

    // If we created a vnode
    if (vnode) {
        // patch that guy
        patch(element, vnode as ComponentVNode); // eslint-disable-line no-undef
        // Handle insertion and removal from the DOM
        element[ConnectingSlot] = () => {
            insert(vnode as ComponentVNode); // eslint-disable-line no-undef
        };
        element[DisconnectingSlot] = () => {
            forceDisconnection(vnode as ComponentVNode); // eslint-disable-line no-undef
        };
    }

    return element;
}
