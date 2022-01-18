/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    assert,
    create,
    isArray,
    isTrue,
    isFalse,
    isNull,
    isUndefined,
    keys,
    SVG_NAMESPACE,
    KEY__SHADOW_RESOLVER,
} from '@lwc/shared';

import {
    remove,
    insert,
    nextSibling,
    createElement,
    createText,
    setText,
    createComment,
    getClassList,
    isSyntheticShadowDefined,
} from '../renderer';

import { EmptyArray } from './utils';
import { markComponentAsDirty } from './component';
import { getUpgradableConstructor } from './upgradable-element';
import { patchElementWithRestrictions, unlockDomMutation, lockDomMutation } from './restrictions';
import {
    createVM,
    appendVM,
    removeVM,
    rerenderVM,
    getAssociatedVMIfPresent,
    runConnectedCallback,
    VM,
    VMState,
    ShadowMode,
    RenderMode,
    LwcDomMode,
} from './vm';
import {
    VNode,
    VNodes,
    VCustomElement,
    VElement,
    VText,
    VComment,
    Hooks,
    Key,
    VBaseElement,
    isVBaseElement,
    isSameVnode,
} from './vnodes';

import { patchAttributes } from './modules/attrs';
import { patchProps } from './modules/props';
import { patchClassAttribute } from './modules/computed-class-attr';
import { patchStyleAttribute } from './modules/computed-style-attr';
import { applyEventListeners } from './modules/events';
import { applyStaticClassAttribute } from './modules/static-class-attr';
import { applyStaticStyleAttribute } from './modules/static-style-attr';

export const TextHook: Hooks<VText> = {
    create: (vnode) => {
        const { owner } = vnode;

        const elm = createText(vnode.text!);
        linkNodeToShadow(elm, owner);
        vnode.elm = elm;
    },
    update: updateNodeHook,
    insert: insertNode,
    move: insertNode, // same as insert for text nodes
    remove: removeNode,
};

export const CommentHook: Hooks<VComment> = {
    create: (vnode) => {
        const { owner, text } = vnode;

        const elm = createComment(text);
        linkNodeToShadow(elm, owner);
        vnode.elm = elm;
    },
    update: updateNodeHook,
    insert: insertNode,
    move: insertNode,
    remove: removeNode,
};

// insert is called after update, which is used somewhere else (via a module)
// to mark the vm as inserted, that means we cannot use update as the main channel
// to rehydrate when dirty, because sometimes the element is not inserted just yet,
// which breaks some invariants. For that reason, we have the following for any
// Custom Element that is inserted via a template.
export const ElementHook: Hooks<VElement> = {
    create: (vnode) => {
        const {
            sel,
            owner,
            data: { svg },
        } = vnode;

        const namespace = isTrue(svg) ? SVG_NAMESPACE : undefined;
        const elm = createElement(sel, namespace);

        linkNodeToShadow(elm, owner);
        fallbackElmHook(elm, vnode);
        vnode.elm = elm;

        patchElementPropsAndAttrs(null, vnode);
    },
    update: (oldVnode, vnode) => {
        patchElementPropsAndAttrs(oldVnode, vnode);
        patchChildren(vnode.elm!, oldVnode.children, vnode.children);
    },
    insert: (vnode, parentNode, referenceNode) => {
        insertNode(vnode, parentNode, referenceNode);
        createChildrenHook(vnode);
    },
    move: insertNode,
    remove: (vnode, parentNode) => {
        removeNode(vnode, parentNode);
        removeChildren(vnode);
    },
};

export const CustomElementHook: Hooks<VCustomElement> = {
    create: (vnode) => {
        const { sel, owner } = vnode;
        const UpgradableConstructor = getUpgradableConstructor(sel);
        /**
         * Note: if the upgradable constructor does not expect, or throw when we new it
         * with a callback as the first argument, we could implement a more advanced
         * mechanism that only passes that argument if the constructor is known to be
         * an upgradable custom element.
         */
        let vm: VM | undefined;
        const elm = new UpgradableConstructor((elm: HTMLElement) => {
            // the custom element from the registry is expecting an upgrade callback
            vm = createViewModelHook(elm, vnode);
        });

        linkNodeToShadow(elm, owner);
        vnode.elm = elm;

        if (vm) {
            allocateChildren(vnode, vm);
        } else if (vnode.ctor !== UpgradableConstructor) {
            throw new TypeError(`Incorrect Component Constructor`);
        }
        patchElementPropsAndAttrs(null, vnode);
    },
    update: (oldVnode, vnode) => {
        patchElementPropsAndAttrs(oldVnode, vnode);
        const vm = getAssociatedVMIfPresent(vnode.elm);
        if (vm) {
            // in fallback mode, the allocation will always set children to
            // empty and delegate the real allocation to the slot elements
            allocateChildren(vnode, vm);
        }
        // in fallback mode, the children will be always empty, so, nothing
        // will happen, but in native, it does allocate the light dom
        patchChildren(vnode.elm!, oldVnode.children, vnode.children);
        if (vm) {
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(
                    isArray(vnode.children),
                    `Invalid vnode for a custom element, it must have children defined.`
                );
            }
            // this will probably update the shadowRoot, but only if the vm is in a dirty state
            // this is important to preserve the top to bottom synchronous rendering phase.
            rerenderVM(vm);
        }
    },
    insert: (vnode, parentNode, referenceNode) => {
        insertNode(vnode, parentNode, referenceNode);
        const vm = getAssociatedVMIfPresent(vnode.elm);
        if (vm) {
            if (process.env.NODE_ENV !== 'production') {
                assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
            }
            runConnectedCallback(vm);
        }
        createChildrenHook(vnode);
        if (vm) {
            appendVM(vm);
        }
    },
    move: insertNode,
    remove: (vnode, parentNode) => {
        removeNode(vnode, parentNode);
        const vm = getAssociatedVMIfPresent(vnode.elm);
        if (vm) {
            // for custom elements we don't have to go recursively because the removeVM routine
            // will take care of disconnecting any child VM attached to its shadow as well.
            removeVM(vm);
        }
    }
};

function isVNode(vnode: any): vnode is VNode {
    return vnode != null;
}

function observeElementChildNodes(elm: Element) {
    (elm as any).$domManual$ = true;
}

function setElementShadowToken(elm: Element, token: string | undefined) {
    (elm as any).$shadowToken$ = token;
}

// Set the scope token class for *.scoped.css styles
function setScopeTokenClassIfNecessary(elm: Element, owner: VM) {
    const { cmpTemplate, context } = owner;
    const token = cmpTemplate?.stylesheetToken;
    if (!isUndefined(token) && context.hasScopedStyles) {
        getClassList(elm).add(token);
    }
}

function linkNodeToShadow(elm: Node, owner: VM) {
    const { renderRoot, renderMode, shadowMode } = owner;

    // TODO [#1164]: this should eventually be done by the polyfill directly
    if (isSyntheticShadowDefined) {
        if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
            (elm as any)[KEY__SHADOW_RESOLVER] = renderRoot[KEY__SHADOW_RESOLVER];
        }
    }
}

function updateNodeHook(oldVnode: VText | VComment, vnode: VText | VComment) {
    const { elm, text } = vnode;

    if (oldVnode.text !== text) {
        if (process.env.NODE_ENV !== 'production') {
            unlockDomMutation();
        }
        setText(elm, text!);
        if (process.env.NODE_ENV !== 'production') {
            lockDomMutation();
        }
    }
}

function insertNode(vnode: VNode, parentNode: Node, referenceNode: Node | null) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    insert(vnode.elm!, parentNode, referenceNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function removeNode(vnode: VNode, parentNode: Node) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    remove(vnode.elm!, parentNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function patchElementPropsAndAttrs(oldVnode: VBaseElement | null, vnode: VBaseElement) {
    if (isNull(oldVnode)) {
        applyEventListeners(vnode);
        applyStaticClassAttribute(vnode);
        applyStaticStyleAttribute(vnode);
    }

    // Attrs need to be applied to element before props IE11 will wipe out value on radio inputs if
    // value is set before type=radio.
    patchClassAttribute(oldVnode, vnode);
    patchStyleAttribute(oldVnode, vnode);
    patchAttributes(oldVnode, vnode);
    patchProps(oldVnode, vnode);
}

function fallbackElmHook(elm: Element, vnode: VBaseElement) {
    const { owner } = vnode;
    setScopeTokenClassIfNecessary(elm, owner);
    if (owner.shadowMode === ShadowMode.Synthetic) {
        const {
            data: { context },
        } = vnode;
        const { stylesheetToken } = owner.context;
        if (
            !isUndefined(context) &&
            !isUndefined(context.lwc) &&
            context.lwc.dom === LwcDomMode.Manual
        ) {
            // this element will now accept any manual content inserted into it
            observeElementChildNodes(elm);
        }
        // when running in synthetic shadow mode, we need to set the shadowToken value
        // into each element from the template, so they can be styled accordingly.
        setElementShadowToken(elm, stylesheetToken);
    }
    if (process.env.NODE_ENV !== 'production') {
        const {
            data: { context },
        } = vnode;
        const isPortal =
            !isUndefined(context) &&
            !isUndefined(context.lwc) &&
            context.lwc.dom === LwcDomMode.Manual;
        const isLight = owner.renderMode === RenderMode.Light;
        patchElementWithRestrictions(elm, { isPortal, isLight });
    }
}

export function patchChildren(parent: ParentNode, oldCh: VNodes, newCh: VNodes) {
    if (hasDynamicChildren(newCh)) {
        updateDynamicChildren(parent, oldCh, newCh);
    } else {
        updateStaticChildren(parent, oldCh, newCh);
    }
}

export function allocateChildren(vnode: VCustomElement, vm: VM) {
    // A component with slots will re-render because:
    // 1- There is a change of the internal state.
    // 2- There is a change on the external api (ex: slots)
    //
    // In case #1, the vnodes in the cmpSlots will be reused since they didn't changed. This routine emptied the
    // slotted children when those VCustomElement were rendered and therefore in subsequent calls to allocate children
    // in a reused VCustomElement, there won't be any slotted children.
    // For those cases, we will use the reference for allocated children stored when rendering the fresh VCustomElement.
    //
    // In case #2, we will always get a fresh VCustomElement.
    const children = vnode.aChildren || vnode.children;

    vm.aChildren = children;

    const { renderMode, shadowMode } = vm;
    if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
        // slow path
        allocateInSlot(vm, children);
        // save the allocated children in case this vnode is reused.
        vnode.aChildren = children;
        // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
        vnode.children = EmptyArray;
    }
}

function createViewModelHook(elm: HTMLElement, vnode: VCustomElement): VM {
    let vm = getAssociatedVMIfPresent(elm);

    // There is a possibility that a custom element is registered under tagName, in which case, the
    // initialization is already carry on, and there is nothing else to do here since this hook is
    // called right after invoking `document.createElement`.
    if (!isUndefined(vm)) {
        return vm;
    }

    const { sel, mode, ctor, owner } = vnode;

    setScopeTokenClassIfNecessary(elm, owner);
    if (owner.shadowMode === ShadowMode.Synthetic) {
        const { stylesheetToken } = owner.context;
        // when running in synthetic shadow mode, we need to set the shadowToken value
        // into each element from the template, so they can be styled accordingly.
        setElementShadowToken(elm, stylesheetToken);
    }

    vm = createVM(elm, ctor, {
        mode,
        owner,
        tagName: sel,
    });

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            isArray(vnode.children),
            `Invalid vnode for a custom element, it must have children defined.`
        );
    }

    return vm;
}

function createChildrenHook(vnode: VBaseElement) {
    const { elm, children } = vnode;
    for (let j = 0; j < children.length; ++j) {
        const ch = children[j];
        if (ch != null) {
            ch.hook.create(ch);
            ch.hook.insert(ch, elm!, null);
        }
    }
}

function removeChildren(vnode: VElement) {
    // this method only needs to search on child vnodes from template
    // to trigger the remove hook just in case some of those children
    // are custom elements.
    const { children, elm } = vnode;
    for (let j = 0, len = children.length; j < len; ++j) {
        const ch = children[j];
        if (!isNull(ch)) {
            ch.hook.remove(ch, elm!);
        }
    }
}

function allocateInSlot(vm: VM, children: VNodes) {
    const { cmpSlots: oldSlots } = vm;
    const cmpSlots = (vm.cmpSlots = create(null));
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (isNull(vnode)) {
            continue;
        }

        let slotName = '';
        if (isVBaseElement(vnode)) {
            slotName = (vnode.data.attrs?.slot as string) || '';
        }

        const vnodes: VNodes = (cmpSlots[slotName] = cmpSlots[slotName] || []);
        // re-keying the vnodes is necessary to avoid conflicts with default content for the slot
        // which might have similar keys. Each vnode will always have a key that
        // starts with a numeric character from compiler. In this case, we add a unique
        // notation for slotted vnodes keys, e.g.: `@foo:1:1`
        if (!isUndefined(vnode.key)) {
            vnode.key = `@${slotName}:${vnode.key}`;
        }
        ArrayPush.call(vnodes, vnode);
    }
    if (isFalse(vm.isDirty)) {
        // We need to determine if the old allocation is really different from the new one
        // and mark the vm as dirty
        const oldKeys = keys(oldSlots);
        if (oldKeys.length !== keys(cmpSlots).length) {
            markComponentAsDirty(vm);
            return;
        }
        for (let i = 0, len = oldKeys.length; i < len; i += 1) {
            const key = oldKeys[i];
            if (isUndefined(cmpSlots[key]) || oldSlots[key].length !== cmpSlots[key].length) {
                markComponentAsDirty(vm);
                return;
            }
            const oldVNodes = oldSlots[key];
            const vnodes = cmpSlots[key];
            for (let j = 0, a = cmpSlots[key].length; j < a; j += 1) {
                if (oldVNodes[j] !== vnodes[j]) {
                    markComponentAsDirty(vm);
                    return;
                }
            }
        }
    }
}

// Using a WeakMap instead of a WeakSet because this one works in IE11 :(
const FromIteration: WeakMap<VNodes, 1> = new WeakMap();

// dynamic children means it was generated by an iteration
// in a template, and will require a more complex diffing algo.
export function markAsDynamicChildren(children: VNodes) {
    FromIteration.set(children, 1);
}

function hasDynamicChildren(children: VNodes): boolean {
    return FromIteration.has(children);
}

function createKeyToOldIdx(
    children: VNodes,
    beginIdx: number,
    endIdx: number
): Record<Key, number> {
    const map: Record<Key, number> = {};

    // TODO [#1637]: simplify this by assuming that all vnodes has keys
    for (let j = beginIdx; j <= endIdx; ++j) {
        const ch = children[j];
        if (isVNode(ch)) {
            const { key } = ch;
            if (key !== undefined) {
                map[key] = j;
            }
        }
    }
    return map;
}

function addVnodes(
    parentElm: Node,
    before: Node | null,
    vnodes: VNodes,
    startIdx: number,
    endIdx: number
) {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        if (isVNode(ch)) {
            ch.hook.create(ch);
            ch.hook.insert(ch, parentElm, before);
        }
    }
}

function removeVnodes(parentElm: Node, vnodes: VNodes, startIdx: number, endIdx: number): void {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        // text nodes do not have logic associated to them
        if (isVNode(ch)) {
            ch.hook.remove(ch, parentElm);
        }
    }
}

function updateDynamicChildren(parentElm: Node, oldCh: VNodes, newCh: VNodes) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    const newChEnd = newCh.length - 1;
    let newEndIdx = newChEnd;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx: any;
    let idxInOld: number;
    let elmToMove: VNode | null | undefined;
    let before: any;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (!isVNode(oldStartVnode)) {
            oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
        } else if (!isVNode(oldEndVnode)) {
            oldEndVnode = oldCh[--oldEndIdx];
        } else if (!isVNode(newStartVnode)) {
            newStartVnode = newCh[++newStartIdx];
        } else if (!isVNode(newEndVnode)) {
            newEndVnode = newCh[--newEndIdx];
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            patchVnode(oldStartVnode, newEndVnode);
            newEndVnode.hook.move(oldStartVnode, parentElm, nextSibling(oldEndVnode.elm!));
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            patchVnode(oldEndVnode, newStartVnode);
            newStartVnode.hook.move(oldEndVnode, parentElm, oldStartVnode.elm!);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            }
            idxInOld = oldKeyToIdx[newStartVnode.key!];
            if (isUndefined(idxInOld)) {
                // New element
                newStartVnode.hook.create(newStartVnode);
                newStartVnode.hook.insert(newStartVnode, parentElm, oldStartVnode.elm!);
                newStartVnode = newCh[++newStartIdx];
            } else {
                elmToMove = oldCh[idxInOld];
                if (isVNode(elmToMove)) {
                    if (elmToMove.sel !== newStartVnode.sel) {
                        // New element
                        newStartVnode.hook.create(newStartVnode);
                        newStartVnode.hook.insert(newStartVnode, parentElm, oldStartVnode.elm!);
                    } else {
                        patchVnode(elmToMove, newStartVnode);
                        oldCh[idxInOld] = undefined as any;
                        newStartVnode.hook.move(elmToMove, parentElm, oldStartVnode.elm!);
                    }
                }
                newStartVnode = newCh[++newStartIdx];
            }
        }
    }
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
        if (oldStartIdx > oldEndIdx) {
            // There's some cases in which the sub array of vnodes to be inserted is followed by null(s) and an
            // already processed vnode, in such cases the vnodes to be inserted should be before that processed vnode.
            let i = newEndIdx;
            let n;
            do {
                n = newCh[++i];
            } while (!isVNode(n) && i < newChEnd);
            before = isVNode(n) ? n.elm : null;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx);
        } else {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }
}

function updateStaticChildren(parentElm: Node, oldCh: VNodes, newCh: VNodes) {
    const oldChLength = oldCh.length;
    const newChLength = newCh.length;

    if (oldChLength === 0) {
        // the old list is empty, we can directly insert anything new
        addVnodes(parentElm, null, newCh, 0, newChLength);
        return;
    }
    if (newChLength === 0) {
        // the old list is nonempty and the new list is empty so we can directly remove all old nodes
        // this is the case in which the dynamic children of an if-directive should be removed
        removeVnodes(parentElm, oldCh, 0, oldChLength);
        return;
    }
    // if the old list is not empty, the new list MUST have the same
    // amount of nodes, that's why we call this static children
    let referenceElm: Node | null = null;
    for (let i = newChLength - 1; i >= 0; i -= 1) {
        const vnode = newCh[i];
        const oldVNode = oldCh[i];
        if (vnode !== oldVNode) {
            if (isVNode(oldVNode)) {
                if (isVNode(vnode)) {
                    // both vnodes must be equivalent, and se just need to patch them
                    patchVnode(oldVNode, vnode);
                    referenceElm = vnode.elm!;
                } else {
                    // removing the old vnode since the new one is null
                    oldVNode.hook.remove(oldVNode, parentElm);
                }
            } else if (isVNode(vnode)) {
                // this condition is unnecessary
                vnode.hook.create(vnode);
                // insert the new node one since the old one is null
                vnode.hook.insert(vnode, parentElm, referenceElm);
                referenceElm = vnode.elm!;
            }
        }
    }
}

function patchVnode(oldVnode: VNode, vnode: VNode) {
    if (oldVnode !== vnode) {
        vnode.elm = oldVnode.elm;
        vnode.hook.update(oldVnode, vnode);
    }
}
