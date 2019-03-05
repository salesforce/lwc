/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { isArray, isUndefined, isTrue, hasOwnProperty, isNull } from '../shared/language';
import { EmptyArray, ViewModelReflection, EmptyObject } from './utils';
import {
    rerenderVM,
    createVM,
    removeVM,
    getCustomElementVM,
    allocateInSlot,
    setNodeOwnerKey,
    appendVM,
    runWithBoundaryProtection,
} from './vm';
import { VNode, VNodes, VCustomElement, VElement } from '../3rdparty/snabbdom/types';
import { nodeValueSetter, insertBefore, removeChild } from '../env/node';
import modEvents from './modules/events';
import modAttrs from './modules/attrs';
import modProps from './modules/props';
import modComputedClassName from './modules/computed-class-attr';
import modComputedStyle from './modules/computed-style-attr';
import modStaticClassName from './modules/static-class-attr';
import modStaticStyle from './modules/static-style-attr';
import modContext from './modules/context';
import { hasDynamicChildren } from './patch';
import { updateDynamicChildren, updateStaticChildren } from '../3rdparty/snabbdom/snabbdom';
import { patchCustomElementWithRestrictions, patchElementWithRestrictions } from './restrictions';
import {
    patchElementProto,
    patchTextNodeProto,
    patchCommentNodeProto,
    patchCustomElementProto,
} from './patch';
import { getComponentDef, setElementProto } from './def';

const noop = () => void 0;

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
    const { uid, fallback } = vnode.owner;
    setNodeOwnerKey(text, uid);
    if (isTrue(fallback)) {
        patchTextNodeProto(text);
    }
}

export function createCommentHook(vnode: VNode) {
    const comment = vnode.elm as Comment;
    const { uid, fallback } = vnode.owner;
    setNodeOwnerKey(comment, uid);
    if (isTrue(fallback)) {
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
    modContext.create(vnode);
}

enum LWCDOMMode {
    manual = 'manual',
}

export function createElmHook(vnode: VElement) {
    const { owner, sel } = vnode;
    const elm = vnode.elm as HTMLElement;
    setNodeOwnerKey(elm, owner.uid);
    if (isTrue(owner.fallback)) {
        const {
            data: { context },
        } = vnode;
        const { shadowAttribute } = owner.context;
        const isPortal =
            !isUndefined(context) &&
            !isUndefined(context.lwc) &&
            context.lwc.dom === LWCDOMMode.manual;
        patchElementProto(elm, {
            sel,
            isPortal,
            shadowAttribute,
        });
    }
    if (process.env.NODE_ENV !== 'production') {
        const {
            data: { context },
        } = vnode;
        const isPortal =
            !isUndefined(context) &&
            !isUndefined(context.lwc) &&
            context.lwc.dom === LWCDOMMode.manual;
        patchElementWithRestrictions(elm, { isPortal });
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
}

export function updateChildrenHook(oldVnode: VElement, vnode: VElement) {
    const { children, owner } = vnode;
    const fn = hasDynamicChildren(children) ? updateDynamicChildren : updateStaticChildren;
    runWithBoundaryProtection(
        owner,
        owner.owner,
        noop,
        () => {
            fn(vnode.elm as Element, oldVnode.children, children);
        },
        noop
    );
}

export function allocateChildrenHook(vnode: VCustomElement) {
    if (isTrue(vnode.owner.fallback)) {
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
    const { mode, ctor, owner } = vnode;
    const { uid, fallback } = owner;
    setNodeOwnerKey(elm, uid);
    const def = getComponentDef(ctor);
    setElementProto(elm, def);
    if (isTrue(fallback)) {
        const { shadowAttribute } = owner.context;
        patchCustomElementProto(elm, {
            def,
            shadowAttribute,
        });
    }
    createVM(vnode.sel as string, elm, ctor, {
        mode,
        fallback,
        owner,
    });
    const vm = getCustomElementVM(elm);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(
            isArray(vnode.children),
            `Invalid vnode for a custom element, it must have children defined.`
        );
    }
    if (process.env.NODE_ENV !== 'production') {
        patchCustomElementWithRestrictions(elm, EmptyObject);
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
    modContext.create(vnode);
}

export function createChildrenHook(vnode: VElement) {
    const { elm, children } = vnode;
    for (let j = 0; j < children.length; ++j) {
        const ch = children[j];
        if (ch != null) {
            ch.hook.create(ch);
            ch.hook.insert(ch, elm as Element, null);
        }
    }
}

export function rerenderCustomElmHook(vnode: VCustomElement) {
    const vm = getCustomElementVM(vnode.elm as HTMLElement);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(
            isArray(vnode.children),
            `Invalid vnode for a custom element, it must have children defined.`
        );
    }
    rerenderVM(vm);
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
    // this method only needs to search on child vnodes from template
    // to trigger the remove hook just in case some of those children
    // are custom elements.
    const { children, elm } = vnode;
    for (let j = 0, len = children.length; j < len; ++j) {
        const ch = children[j];
        if (!isNull(ch)) {
            ch.hook.remove(ch, elm as HTMLElement);
        }
    }
}

export function removeCustomElmHook(vnode: VCustomElement) {
    // for custom elements we don't have to go recursively because the removeVM routine
    // will take care of disconnecting any child VM attached to its shadow as well.
    removeVM(getCustomElementVM(vnode.elm as HTMLElement));
}
