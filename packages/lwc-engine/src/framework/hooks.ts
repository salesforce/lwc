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
import { patchSlotElement } from "../faux-shadow/slot";
import modEvents from "./modules/events";
import modAttrs from "./modules/attrs";
import modProps from "./modules/props";
import modComputedClassName from "./modules/computed-class-attr";
import modComputedStyle from "./modules/computed-style-attr";
import modStaticClassName from "./modules/static-class-attr";
import modStaticStyle from "./modules/static-style-attr";
import { hasDynamicChildren } from "./patch";
import { updateDynamicChildren, updateStaticChildren } from "../3rdparty/snabbdom/snabbdom";
import { patchCustomElementWithRestrictions, patchElementWithRestrictions } from "./restrictions";
import { patchElementProto, patchTextNodeProto, patchCommentNodeProto, patchCustomElementProto } from "./patch";
import { getComponentDef, setElementProto } from "./def";

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

export function createElmDefaultHook(vnode: VElement) {
    modEvents.create(vnode);
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.create(vnode);
    modProps.create(vnode);
    modStaticClassName.create(vnode);
    modStaticStyle.create(vnode);
    modComputedClassName.create(vnode);
    modComputedStyle.create(vnode);
}

export function createElmHook(vnode: VElement) {
    const { shadowAttribute, uid, sel, fallback } = vnode;
    const elm = vnode.elm as HTMLElement;
    if (!isUndefined(shadowAttribute)) {
        setAttribute.call(elm, shadowAttribute, '');
    }
    setNodeOwnerKey(elm, uid);
    if (isTrue(fallback)) {
        patchElementProto(elm, sel);
    }
    if (process.env.NODE_ENV !== 'production') {
        patchElementWithRestrictions(elm);
    }
}

export function createSlotElmHook(vnode: VElement) {
    const { fallback } = vnode;
    if (isTrue(fallback)) {
        // special logic to support slotchange event in fallback mode
        const elm = vnode.elm as HTMLSlotElement;
        patchSlotElement(elm);
    }
}

export function updateElmDefaultHook(oldVnode: VElement, vnode: VElement) {
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.update(oldVnode, vnode);
    modProps.update(oldVnode, vnode);
    modComputedClassName.update(oldVnode, vnode);
    modComputedStyle.update(oldVnode, vnode);
}

export function insertCustomElmHook(vnode: VCustomElement) {
    const vm = getCustomElementVM(vnode.elm as HTMLElement);
    appendVM(vm);
    renderVM(vm);
}

export function updateChildrenHook(oldVnode: VElement, vnode: VElement) {
    const { children } = vnode;
    const fn = hasDynamicChildren(children) ?  updateDynamicChildren : updateStaticChildren;
    fn(vnode.elm as Element, oldVnode.children, children);
}

export function allocateChildrenHook(vnode: VCustomElement) {
    if (isTrue(vnode.fallback)) {
        // slow path
        const elm = vnode.elm as HTMLElement;
        const vm = getCustomElementVM(elm);
        const children = vnode.children as VNodes;
        allocateInSlot(vm, children);
        // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
        vnode.children = EmptyArray;
    }
}

export function createCustomElmHook(vnode: VCustomElement) {
    const elm = vnode.elm as HTMLElement;
    if (hasOwnProperty.call(elm, ViewModelReflection)) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here since this hook is called right after invoking `document.createElement`.
        return;
    }
    const { mode, ctor, shadowAttribute, uid, sel, fallback } = vnode;
    if (!isUndefined(shadowAttribute)) {
        setAttribute.call(elm, shadowAttribute, '');
    }
    setNodeOwnerKey(elm, uid);
    const def = getComponentDef(ctor);
    setElementProto(elm, def);
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
}

export function createCustomElmDefaultHook(vnode: VCustomElement) {
    modEvents.create(vnode);
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.create(vnode);
    modProps.create(vnode);
    modStaticClassName.create(vnode);
    modStaticStyle.create(vnode);
    modComputedClassName.create(vnode);
    modComputedStyle.create(vnode);
}

export function createChildrenHook(vnode: VElement) {
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

export function renderCustomElmHook(vnode: VCustomElement) {
    const vm = getCustomElementVM(vnode.elm as HTMLElement);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isArray(vnode.children), `Invalid vnode for a custom element, it must have children defined.`);
    }
    renderVM(vm);
}

export function updateCustomElmDefaultHook(oldVnode: VCustomElement, vnode: VCustomElement) {
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.update(oldVnode, vnode);
    modProps.update(oldVnode, vnode);
    modComputedClassName.update(oldVnode, vnode);
    modComputedStyle.update(oldVnode, vnode);
}

export function removeElmHook(vnode: VElement) {
    vnode.hook.destroy(vnode);
}

export function destroyCustomElmHook(vnode: VCustomElement) {
    removeVM(getCustomElementVM(vnode.elm as HTMLElement));
}

export function destroyElmHook(vnode: VElement) {
    const { children } = vnode;
    for (let j = 0, len = children.length; j < len; ++j) {
        const ch = children[j];
        if (ch != null) {
            ch.hook.destroy(ch);
        }
    }
}
