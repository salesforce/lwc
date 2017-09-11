import assert from "./assert";
import { patch } from "./patch";
import { c } from "./api";
import { isUndefined, isFunction, assign } from "./language";
import { insert } from "./hook";
import { removeInsertionIndex } from "./vm";
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

/**
 * This algo mimics 2.5 of web component specification somehow:
 * https://www.w3.org/TR/custom-elements/#upgrades
 */
function upgradeElement(element: HTMLElement, Ctor: Class<Component>) {
    if (isUndefined(Ctor)) {
        throw new TypeError(`Invalid Component Definition: ${Ctor}.`);
    }
    const tagName = element.tagName.toLowerCase();
    const vnode = c(tagName, Ctor, { className: element.className || undefined });
    vnode.isRoot = true;
    patch(element, vnode);
    // providing the hook to detect insertion and removal
    element[ConnectingSlot] = () => {
        insert(vnode);
    };
    element[DisconnectingSlot] = () => {
        forceDisconnection(vnode);
    };
}

// this could happen for two reasons:
// * it is a root, and was removed manually
// * the element was appended to another container which requires disconnection to happen first
export function forceDisconnection(vnode: ComponentVNode) {
    assert.vnode(vnode);
    const { vm } = vnode;
    assert.vm(vm);
    // At this point we need to force the removal of all children
    const oldVnode = assign({}, vnode);
    vnode.children = [];
    vm.isDirty = true;
    vm.fragment = [];
    removeInsertionIndex(vm);
    clearListeners(vm);
    patch(oldVnode, vnode);
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
    const element = document.createElement(tagName, Ctor ? null : options);

    if (Ctor && element instanceof HTMLElement) {
        upgradeElement(element, Ctor);
    }
    return element;
}
