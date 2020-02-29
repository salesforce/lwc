/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isArray, isTrue, isUndefined } from '@lwc/shared';
import { reactWhenConnected, reactWhenDisconnected } from '@lwc/node-reactions';
import { EmptyArray, EmptyObject, useSyntheticShadow } from './utils';
import {
    rerenderVM,
    createVM,
    removeVM,
    getAssociatedVM,
    allocateInSlot,
    appendVM,
    runWithBoundaryProtection,
    getAssociatedVMIfPresent,
    VMState,
} from './vm';
import { VNode, VCustomElement, VElement, VNodes } from '../3rdparty/snabbdom/types';
import modEvents from './modules/events';
import modAttrs from './modules/attrs';
import modProps from './modules/props';
import modComputedClassName from './modules/computed-class-attr';
import modComputedStyle from './modules/computed-style-attr';
import modStaticClassName from './modules/static-class-attr';
import modStaticStyle from './modules/static-style-attr';
import modContext from './modules/context';
import { updateDynamicChildren, updateStaticChildren } from '../3rdparty/snabbdom/snabbdom';
import {
    patchCustomElementWithRestrictions,
    patchElementWithRestrictions,
    unlockDomMutation,
    lockDomMutation,
} from './restrictions';
import { getComponentDef, setElementProto } from './def';

const noop = () => void 0;

function observeElementChildNodes(elm: Element) {
    (elm as any).$domManual$ = true;
}

function setElementShadowToken(elm: Element, token: string | undefined) {
    (elm as any).$shadowToken$ = token;
}

export function updateNodeHook(oldVnode: VNode, vnode: VNode) {
    const { text } = vnode;
    if (oldVnode.text !== text) {
        if (process.env.NODE_ENV !== 'production') {
            unlockDomMutation();
        }
        /**
         * Compiler will never produce a text property that is not string
         */
        vnode.elm!.nodeValue = text!;
        if (process.env.NODE_ENV !== 'production') {
            lockDomMutation();
        }
    }
}

export function insertNodeHook(vnode: VNode, parentNode: Node, referenceNode: Node | null) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    parentNode.insertBefore(vnode.elm!, referenceNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

export function removeNodeHook(vnode: VNode, parentNode: Node) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    parentNode.removeChild(vnode.elm!);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

export function createElmHook(vnode: VElement) {
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

export function fallbackElmHook(vnode: VElement) {
    const { owner } = vnode;
    const elm = vnode.elm!;
    if (isTrue(useSyntheticShadow)) {
        const {
            data: { context },
        } = vnode;
        const { shadowAttribute } = owner.context;
        if (
            !isUndefined(context) &&
            !isUndefined(context.lwc) &&
            context.lwc.dom === LWCDOMMode.manual
        ) {
            // this element will now accept any manual content inserted into it
            observeElementChildNodes(elm);
        }
        // when running in synthetic shadow mode, we need to set the shadowToken value
        // into each element from the template, so they can be styled accordingly.
        setElementShadowToken(elm, shadowAttribute);
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

export function updateElmHook(oldVnode: VElement, vnode: VElement) {
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.update(oldVnode, vnode);
    modProps.update(oldVnode, vnode);
    modComputedClassName.update(oldVnode, vnode);
    modComputedStyle.update(oldVnode, vnode);
}

export function updateChildrenHook(oldVnode: VElement, vnode: VElement) {
    const { children, owner } = vnode;
    const fn = hasDynamicChildren(children) ? updateDynamicChildren : updateStaticChildren;
    runWithBoundaryProtection(
        owner,
        owner.owner,
        noop,
        () => {
            fn(vnode.elm!, oldVnode.children, children);
        },
        noop
    );
}

export function allocateChildrenHook(vnode: VCustomElement) {
    const vm = getAssociatedVM(vnode.elm!);
    const { children } = vnode;
    if (isTrue(useSyntheticShadow)) {
        // slow path
        allocateInSlot(vm, children);
        // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
        vnode.children = EmptyArray;
    }
}

function customElementConnectedHook(elm: HTMLElement) {
    const vm = getAssociatedVM(elm);
    if (process.env.NODE_ENV !== 'production') {
        // Either the vm was just created or the node is being moved to another subtree
        assert.isTrue(
            vm.state === VMState.created || vm.state === VMState.disconnected,
            `${vm} cannot be connected.`
        );
    }
    appendVM(vm);
}

function customElementDisconnectedHook(elm: HTMLElement) {
    const vm = getAssociatedVM(elm);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state === VMState.connected, `${vm} should be connected.`);
    }
    removeVM(vm);
}

export function createViewModelHook(vnode: VCustomElement) {
    const elm = vnode.elm as HTMLElement;
    if (!isUndefined(getAssociatedVMIfPresent(elm))) {
        // There is a possibility that a custom element is registered under tagName,
        // in which case, the initialization is already carry on, and there is nothing else
        // to do here since this hook is called right after invoking `document.createElement`.
        return;
    }
    const { mode, ctor, owner } = vnode;
    const def = getComponentDef(ctor);
    setElementProto(elm, def);
    if (isTrue(useSyntheticShadow)) {
        const { shadowAttribute } = owner.context;
        // when running in synthetic shadow mode, we need to set the shadowToken value
        // into each element from the template, so they can be styled accordingly.
        setElementShadowToken(elm, shadowAttribute);
    }
    createVM(elm, ctor, {
        mode,
        owner,
    });
    reactWhenConnected(elm, customElementConnectedHook);
    reactWhenDisconnected(elm, customElementDisconnectedHook);
    if (process.env.NODE_ENV !== 'production') {
        const vm = getAssociatedVM(elm);
        assert.isTrue(vm && 'cmpRoot' in vm, `${vm} is not a vm.`);
        assert.isTrue(
            isArray(vnode.children),
            `Invalid vnode for a custom element, it must have children defined.`
        );

        patchCustomElementWithRestrictions(elm, EmptyObject);
    }
}

export function createCustomElmHook(vnode: VCustomElement) {
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
            ch.hook.insert(ch, elm!, null);
        }
    }
}

export function rerenderCustomElmHook(vnode: VCustomElement) {
    const vm = getAssociatedVM(vnode.elm!);
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isArray(vnode.children),
            `Invalid vnode for a custom element, it must have children defined.`
        );
    }
    rerenderVM(vm);
}

export function updateCustomElmHook(oldVnode: VCustomElement, vnode: VCustomElement) {
    // Attrs need to be applied to element before props
    // IE11 will wipe out value on radio inputs if value
    // is set before type=radio.
    modAttrs.update(oldVnode, vnode);
    modProps.update(oldVnode, vnode);
    modComputedClassName.update(oldVnode, vnode);
    modComputedStyle.update(oldVnode, vnode);
}

// Using a WeakMap instead of a WeakSet because this one works in IE11 :(
const FromIteration: WeakMap<VNodes, 1> = new WeakMap();

// dynamic children means it was generated by an iteration
// in a template, and will require a more complex diffing algo.
export function markAsDynamicChildren(children: VNodes) {
    FromIteration.set(children, 1);
}

export function hasDynamicChildren(children: VNodes): boolean {
    return FromIteration.has(children);
}
