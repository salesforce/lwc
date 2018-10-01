import assert from "../shared/assert";
import { isArray, isUndefined, isTrue, hasOwnProperty } from "../shared/language";
import { EmptyArray, ViewModelReflection } from "./utils";
import { renderVM, createVM, appendVM, removeVM, getCustomElementVM, allocateInSlot, setNodeOwnerKey } from "./vm";
import { VNode, VNodes, VCustomElement, VElement } from "../3rdparty/snabbdom/types";
import {
    setAttribute,
    nodeValueSetter,
    insertBefore,
    removeChild,
} from "./dom-api";
import { patchCustomElementWithRestrictions, patchElementWithRestrictions } from "./restrictions";
import { patchElementProto, patchTextNodeProto, patchCommentNodeProto, patchCustomElementProto } from "./patch";
import { getComponentDef } from "./def";

export function updateNodeHook(oldVnode: VNode, vnode: VNode) {
    if (oldVnode.text !== vnode.text) {
        nodeValueSetter.call(vnode.elm as Node, vnode.text);
    }
}

export function insertNodeHook(vnode: VNode, parentNode: Node, referenceNode: Node | null) {
    insertBefore.call(parentNode, vnode.elm as Node, referenceNode);
}

export function removeNodeHook(vnode: VNode, parentNode: Node) {
    removeChild.call(parentNode, vnode.elm as Node);
}

export function createTextHook(vnode: VNode) {
    const text = vnode.elm as Text;
    setNodeOwnerKey(text, vnode.uid);
    if (isTrue(vnode.fallback)) {
        patchTextNodeProto(text);
    }
}

export function createCommentHook(vnode: VNode) {
    const comment = vnode.elm as Comment;
    setNodeOwnerKey(comment, vnode.uid);
    if (isTrue(vnode.fallback)) {
        patchCommentNodeProto(comment);
    }
}

export const createElmHook = (vnode: VElement) => {
    const { token, uid, sel, fallback } = vnode;
    const elm = vnode.elm as HTMLElement;
    if (!isUndefined(token)) {
        setAttribute.call(elm, token, '');
    }
    setNodeOwnerKey(elm, uid);
    if (isTrue(fallback)) {
        patchElementProto(elm, sel);
    }
    if (process.env.NODE_ENV !== 'production') {
        patchElementWithRestrictions(elm);
    }
};

export const insertCustomElmHook = (vnode: VCustomElement) => {
    const vm = getCustomElementVM(vnode.elm as HTMLElement);
    appendVM(vm);
    renderVM(vm);
};

export const createCustomElmHook = (vnode: VCustomElement) => {
    const elm = vnode.elm as HTMLElement;
    if (hasOwnProperty.call(elm, ViewModelReflection)) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here since this hook is called right after invoking `document.createElement`.
        return;
    }
    const { mode, ctor, token, uid, sel, fallback } = vnode;
    if (!isUndefined(token)) {
        setAttribute.call(elm, token, '');
    }
    setNodeOwnerKey(elm, uid);
    const def = getComponentDef(ctor);
    if (isTrue(fallback)) {
        patchCustomElementProto(elm, sel, def);
    }
    createVM(vnode.sel as string, elm, ctor, {
        mode,
        fallback,
    });
    const vm = getCustomElementVM(elm);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isArray(vnode.children), `Invalid vnode for a custom element, it must have children defined.`);
    }
    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(elm);
    }
    if (isTrue(vm.fallback)) {
        // slow path
        const children = vnode.children as VNodes;
        allocateInSlot(vm, children);
        // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
        vnode.children = EmptyArray;
    }
};

export function createChildren(vnode: VElement) {
    const { elm, children } = vnode;
    for (let j = 0; j < children.length; ++j) {
        const ch = children[j];
        if (ch != null) {
            ch.hook.create(ch);
            ch.hook.insert(
                ch,
                elm as Element,
                null,
            );
        }
    }
}

export const updateCustomElmHook = (oldVNode: VCustomElement, vnode: VCustomElement) => {
    const vm = getCustomElementVM(vnode.elm as HTMLElement);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isArray(vnode.children), `Invalid vnode for a custom element, it must have children defined.`);
    }
    if (isTrue(vm.fallback)) {
        // slow path
        const children = vnode.children as VNodes;
        allocateInSlot(vm, children);
        // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
        vnode.children = EmptyArray;
    }
    renderVM(vm);
};

function callDestroyHooks(vnode: VNode) {
    vnode.hook.destroy(vnode);
}

export const removeElmHook = (vnode: VElement) => {
    callDestroyHooks(vnode);
};

export const destroyCustomElmHook = (vnode: VCustomElement) => {
    removeVM(getCustomElementVM(vnode.elm as HTMLElement));
};

export const destroyElmHook = (vnode: VElement) => {
    const { children } = vnode;
    for (let j = 0, len = children.length; j < len; ++j) {
        const ch = children[j];
        if (ch != null) {
            callDestroyHooks(ch);
        }
    }
};
