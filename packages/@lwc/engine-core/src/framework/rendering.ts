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
    Key,
    VBaseElement,
    isVBaseElement,
    isSameVnode,
    VNodeType,
} from './vnodes';

import { patchAttributes } from './modules/attrs';
import { patchProps } from './modules/props';
import { patchClassAttribute } from './modules/computed-class-attr';
import { patchStyleAttribute } from './modules/computed-style-attr';
import { applyEventListeners } from './modules/events';
import { applyStaticClassAttribute } from './modules/static-class-attr';
import { applyStaticStyleAttribute } from './modules/static-style-attr';

export function patchChildren(c1: VNodes, c2: VNodes, parent: ParentNode): void {
    if (hasDynamicChildren(c2)) {
        updateDynamicChildren(c1, c2, parent);
    } else {
        updateStaticChildren(c1, c2, parent);
    }
}

function patch(n1: VNode, n2: VNode) {
    if (n1 === n2) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        if (!isSameVnode(n1, n2)) {
            throw new Error(
                'Expected these VNodes to be the same: ' +
                    JSON.stringify({ sel: n1.sel, key: n1.key }) +
                    ', ' +
                    JSON.stringify({ sel: n2.sel, key: n2.key })
            );
        }
    }

    switch (n2.type) {
        case VNodeType.Text:
            patchText(n1 as VText, n2);
            break;

        case VNodeType.Comment:
            patchComment(n1 as VComment, n2);
            break;

        case VNodeType.Element:
            patchElement(n1 as VElement, n2);
            break;

        case VNodeType.CustomElement:
            patchCustomElement(n1 as VCustomElement, n2);
            break;
    }
}

export function mount(node: VNode, parent: ParentNode, anchor: Node | null) {
    switch (node.type) {
        case VNodeType.Text:
            mountText(node, parent, anchor);
            break;

        case VNodeType.Comment:
            mountComment(node, parent, anchor);
            break;

        case VNodeType.Element:
            mountElement(node, parent, anchor);
            break;

        case VNodeType.CustomElement:
            mountCustomElement(node, parent, anchor);
            break;
    }
}

function patchText(n1: VText, n2: VText) {
    n2.elm = n1.elm;

    if (n2.text !== n1.text) {
        updateTextContent(n2);
    }
}

function mountText(node: VText, parent: ParentNode, anchor: Node | null) {
    const { owner } = node;

    const textNode = (node.elm = createText(node.text));
    linkNodeToShadow(textNode, owner);

    insertNode(textNode, parent, anchor);
}

function patchComment(n1: VComment, n2: VComment) {
    n2.elm = n1.elm;

    // FIXME: Comment nodes should be static, we shouldn't need to diff them together. However
    // it is the case today.
    if (n2.text !== n1.text) {
        updateTextContent(n2);
    }
}

function mountComment(node: VComment, parent: ParentNode, anchor: Node | null) {
    const { owner } = node;

    const commentNode = (node.elm = createComment(node.text));
    linkNodeToShadow(commentNode, owner);

    insertNode(commentNode, parent, anchor);
}

function mountElement(vnode: VElement, parent: ParentNode, anchor: Node | null) {
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

    insertNode(elm, parent, anchor);
    mountVNodes(vnode.children, elm, null);
}

function patchElement(n1: VElement, n2: VElement) {
    const elm = (n2.elm = n1.elm!);

    patchElementPropsAndAttrs(n1, n2);
    patchChildren(n1.children, n2.children, elm);
}

function mountCustomElement(vnode: VCustomElement, parent: ParentNode, anchor: Node | null) {
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
    vnode.vm = vm;

    if (vm) {
        allocateChildren(vnode, vm);
    } else if (vnode.ctor !== UpgradableConstructor) {
        throw new TypeError(`Incorrect Component Constructor`);
    }

    patchElementPropsAndAttrs(null, vnode);
    insertNode(elm, parent, anchor);

    if (vm) {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
        }
        runConnectedCallback(vm);
    }

    mountVNodes(vnode.children, elm, null);

    if (vm) {
        appendVM(vm);
    }
}

function patchCustomElement(n1: VCustomElement, n2: VCustomElement) {
    const elm = (n2.elm = n1.elm!);
    const vm = (n2.vm = n1.vm);

    patchElementPropsAndAttrs(n1, n2);
    if (!isUndefined(vm)) {
        // in fallback mode, the allocation will always set children to
        // empty and delegate the real allocation to the slot elements
        allocateChildren(n2, vm);
    }

    // in fallback mode, the children will be always empty, so, nothing
    // will happen, but in native, it does allocate the light dom
    patchChildren(n1.children, n2.children, elm);

    if (!isUndefined(vm)) {
        // this will probably update the shadowRoot, but only if the vm is in a dirty state
        // this is important to preserve the top to bottom synchronous rendering phase.
        rerenderVM(vm);
    }
}

function mountVNodes(
    vnodes: VNodes,
    parent: ParentNode,
    anchor: Node | null,
    start: number = 0,
    end: number = vnodes.length
) {
    for (; start < end; ++start) {
        const vnode = vnodes[start];
        if (isVNode(vnode)) {
            mount(vnode, parent, anchor);
        }
    }
}

function unmount(vnode: VNode, parent: ParentNode, doRemove: boolean = false) {
    const { type, elm } = vnode;

    // When unmounting a VNode subtree not all the elements have to removed from the DOM. The
    // subtree root, is the only element worth unmounting from the subtree.
    if (doRemove) {
        removeNode(elm!, parent);
    }

    switch (type) {
        case VNodeType.Element:
            unmountVNodes(vnode.children, elm as ParentNode);
            break;

        case VNodeType.CustomElement: {
            const { vm } = vnode;

            // No need to unmount the children here, `removeVM` will take care of removing the
            // children.
            if (!isUndefined(vm)) {
                removeVM(vm);
            }
            break;
        }
    }
}

function unmountVNodes(
    vnodes: VNodes,
    parent: ParentNode,
    doRemove: boolean = false,
    start: number = 0,
    end: number = vnodes.length
) {
    for (; start < end; ++start) {
        const ch = vnodes[start];
        if (isVNode(ch)) {
            unmount(ch, parent, doRemove);
        }
    }
}

function isVNode(vnode: any): vnode is VNode {
    return vnode != null;
}

function observeElementChildNodes(elm: Element) {
    (elm as any).$domManual$ = true;
}

function setElementShadowToken(elm: Element, token: string) {
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

function updateTextContent(vnode: VText | VComment) {
    const { elm, text } = vnode;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    setText(elm, text!);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function insertNode(node: Node, parent: Node, anchor: Node | null) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    insert(node, parent, anchor);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

export function removeNode(node: Node, parent: ParentNode) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    remove(node, parent);
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
        if (!isUndefined(stylesheetToken)) {
            // when running in synthetic shadow mode, we need to set the shadowToken value
            // into each element from the template, so they can be styled accordingly.
            setElementShadowToken(elm, stylesheetToken);
        }
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
        if (!isUndefined(stylesheetToken)) {
            setElementShadowToken(elm, stylesheetToken);
        }
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

function updateDynamicChildren(oldCh: VNodes, newCh: VNodes, parent: ParentNode) {
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
    let clonedOldCh = false;
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
            patch(oldStartVnode, newStartVnode);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            patch(oldStartVnode, newEndVnode);
            insertNode(oldStartVnode.elm!, parent, nextSibling(oldEndVnode.elm!));
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            patch(oldEndVnode, newStartVnode);
            insertNode(newStartVnode.elm!, parent, oldStartVnode.elm!);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            }
            idxInOld = oldKeyToIdx[newStartVnode.key!];
            if (isUndefined(idxInOld)) {
                // New element
                mount(newStartVnode, parent, oldStartVnode.elm!);
                newStartVnode = newCh[++newStartIdx];
            } else {
                elmToMove = oldCh[idxInOld];
                if (isVNode(elmToMove)) {
                    if (elmToMove.sel !== newStartVnode.sel) {
                        // New element
                        mount(newStartVnode, parent, oldStartVnode.elm!);
                    } else {
                        patch(elmToMove, newStartVnode);
                        // Delete the old child, but copy the array since it is read-only.
                        // The `oldCh` will be GC'ed after `updateDynamicChildren` is complete,
                        // so we only care about the `oldCh` object inside this function.
                        // To avoid cloning over and over again, we check `clonedOldCh`
                        // and only clone once.
                        if (!clonedOldCh) {
                            clonedOldCh = true;
                            oldCh = [...oldCh];
                        }

                        // We've already cloned at least once, so it's no longer read-only
                        (oldCh as any[])[idxInOld] = undefined;
                        insertNode(elmToMove.elm!, parent, oldStartVnode.elm!);
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
            mountVNodes(newCh, parent, before, newStartIdx, newEndIdx + 1);
        } else {
            unmountVNodes(oldCh, parent, true, oldStartIdx, oldEndIdx + 1);
        }
    }
}

function updateStaticChildren(c1: VNodes, c2: VNodes, parent: ParentNode) {
    const c1Length = c1.length;
    const c2Length = c2.length;

    if (c1Length === 0) {
        // the old list is empty, we can directly insert anything new
        mountVNodes(c2, parent, null);
        return;
    }

    if (c2Length === 0) {
        // the old list is nonempty and the new list is empty so we can directly remove all old nodes
        // this is the case in which the dynamic children of an if-directive should be removed
        unmountVNodes(c1, parent, true);
        return;
    }

    // if the old list is not empty, the new list MUST have the same
    // amount of nodes, that's why we call this static children
    let anchor: Node | null = null;
    for (let i = c2Length - 1; i >= 0; i -= 1) {
        const n1 = c1[i];
        const n2 = c2[i];

        if (n2 !== n1) {
            if (isVNode(n1)) {
                if (isVNode(n2)) {
                    // both vnodes are equivalent, and we just need to patch them
                    patch(n1, n2);
                    anchor = n2.elm!;
                } else {
                    // removing the old vnode since the new one is null
                    unmount(n1, parent, true);
                }
            } else if (isVNode(n2)) {
                mount(n2, parent, anchor);
                anchor = n2.elm!;
            }
        }
    }
}
