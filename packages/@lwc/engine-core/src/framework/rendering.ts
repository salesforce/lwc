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
    isNull,
    isTrue,
    isUndefined,
    keys,
    KEY__SHADOW_RESOLVER,
} from '@lwc/shared';

import { hasDynamicChildren } from './api';
import { getComponentInternalDef } from './def';
import { markComponentAsDirty } from './component';
import { getUpgradableConstructor } from './upgradable-element';
import { patchElementWithRestrictions, unlockDomMutation, lockDomMutation } from './restrictions';
import { EmptyArray } from './utils';
import {
    createVM,
    getAssociatedVMIfPresent,
    VM,
    ShadowMode,
    RenderMode,
    rerenderVM,
    VMState,
    runConnectedCallback,
    appendVM,
    removeVM,
    getRenderRoot,
    LWCDOMMode,
} from './vm';
import {
    VNode,
    VCustomElement,
    VElement,
    VNodes,
    Key,
    VText,
    VComment,
    VBaseElement,
    VNodeType,
} from './vnode';

import { applyEventListeners } from './modules/events';
import { patchAttributes } from './modules/attrs';
import { patchProps } from './modules/props';
import { patchClassAttribute } from './modules/computed-class-attr';
import { patchStyleAttribute } from './modules/computed-style-attr';
import { applyStaticClassAttribute } from './modules/static-class-attr';
import { applyStaticStyleAttribute } from './modules/static-style-attr';

interface KeyToIndexMap {
    [key: string]: number;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export function patchChildren(parentElm: ParentNode, oldCh: VNodes, newCh: VNodes): void {
    if (hasDynamicChildren(newCh)) {
        updateDynamicChildren(parentElm, oldCh, newCh);
    } else {
        updateStaticChildren(parentElm, oldCh, newCh);
    }
}

function patch(n1: VNode | null, n2: VNode, parent: ParentNode, anchor: Node | null) {
    if (n1 === n2) {
        return;
    }

    // FIXME: When does this occurs, is it possible with LWC?
    if (!isNull(n1) && !sameVnode(n1, n2)) {
        anchor = n2.owner.renderer.nextSibling(n1.elm);
        unmount(n1, parent);
        n1 = null;
    }

    switch (n2.type) {
        case VNodeType.Text:
            processText(n1 as VText, n2, parent, anchor);
            break;

        case VNodeType.Comment:
            processComment(n1 as VComment, n2, parent, anchor);
            break;

        case VNodeType.Element:
            processElement(n1 as VElement, n2, parent, anchor);
            break;

        case VNodeType.CustomElement:
            processCustomElement(n1 as VCustomElement, n2, parent, anchor);
            break;
    }
}

function processText(n1: VText, n2: VText, parent: ParentNode, anchor: Node | null) {
    const { owner } = n2;
    const { renderer } = owner;

    if (isNull(n1)) {
        const textNode = (n2.elm = renderer.createText(n2.text));
        linkNodeToShadow(textNode, owner);

        insertVNode(n2, parent, anchor);
    } else {
        n2.elm = n1.elm;

        if (n2.text !== n1.text) {
            updateTextContent(n2);
        }
    }
}

function processComment(n1: VComment, n2: VComment, parent: ParentNode, anchor: Node | null) {
    const { owner } = n2;
    const { renderer } = owner;

    if (isNull(n1)) {
        const textNode = (n2.elm = renderer.createComment(n2.text));
        linkNodeToShadow(textNode, owner);

        insertVNode(n2, parent, anchor);
    } else {
        n2.elm = n1.elm;

        // FIXME: Comment nodes should be static, we shouldn't need to diff them together. However
        // it is the case today.
        if (n2.text !== n1.text) {
            updateTextContent(n2);
        }
    }
}

function processElement(n1: VElement, n2: VElement, parent: ParentNode, anchor: Node | null) {
    if (isNull(n1)) {
        mountElement(n2, parent, anchor);
    } else {
        patchElement(n1, n2);
    }
}

function mountElement(vnode: VElement, parent: ParentNode, anchor: Node | null) {
    const { sel, owner, data } = vnode;
    const { renderer } = owner;

    const namespace = isTrue(data.svg) ? SVG_NAMESPACE : undefined;
    const elm = (vnode.elm = renderer.createElement(sel, namespace));
    linkNodeToShadow(elm, owner);

    // Handle dom:manual template directive.
    const isDomManual = data.context?.lwc?.dom === LWCDOMMode.manual;
    if (isDomManual) {
        elm.$domManual$ = true;
    }

    applyStyleScoping(elm, vnode);
    patchElementAttrsAndProps(null, vnode);

    // Apply guardrails to the element in dev mode.
    if (process.env.NODE_ENV !== 'production') {
        patchElementWithRestrictions(elm, {
            isPortal: isDomManual,
            isLight: owner.renderMode === RenderMode.Light,
        });
    }

    // Insert node and recursively mount the children tree.
    insertVNode(vnode, parent, anchor);
    mountChildren(vnode.children, elm);
}

function patchElement(n1: VElement, n2: VElement) {
    const elm = (n2.elm = n1.elm!);

    patchElementAttrsAndProps(n1, n2);
    patchChildren(elm, n1.children, n2.children);
}

function processCustomElement(
    n1: VCustomElement,
    n2: VCustomElement,
    parent: ParentNode,
    anchor: Node | null
) {
    if (isNull(n1)) {
        mountCustomElement(n2, parent, anchor);
    } else {
        patchCustomElement(n1, n2);
    }
}

function mountCustomElement(vnode: VCustomElement, parent: ParentNode, anchor: Node | null) {
    const { sel, owner } = vnode;
    const { renderer } = owner;

    let vm: VM | undefined;
    const UpgradableConstructor = getUpgradableConstructor(sel, renderer);

    // Note: if the upgradable constructor does not expect, or throw when we new it with a callback
    // as the first argument, we could implement a more advanced mechanism that only passes that
    // argument if the constructor is known to be an upgradable custom element.
    const elm = (vnode.elm = new UpgradableConstructor((elm: HTMLElement) => {
        if (!isUndefined(getAssociatedVMIfPresent(elm))) {
            // There is a possibility that a custom element is registered under tagName, in which
            // case, the initialization is already carry on, and there is nothing else to do here
            // since this hook is called right after invoking `document.createElement`.
            return;
        }

        const { mode, ctor } = vnode;
        const def = getComponentInternalDef(ctor);

        vm = vnode.vm = createVM(elm, def, {
            mode,
            owner,
            tagName: sel,
            renderer,
        });
    }));

    linkNodeToShadow(elm, owner);

    if (!isUndefined(vm)) {
        allocateCustomElementChildren(vnode, vm);
    } else if (vnode.ctor !== UpgradableConstructor) {
        throw new TypeError(`Incorrect Component Constructor`);
    }

    applyStyleScoping(elm, vnode);
    patchElementAttrsAndProps(null, vnode);

    insertVNode(vnode, parent, anchor);

    if (!isUndefined(vm)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
        }
        runConnectedCallback(vm);
    }

    mountChildren(vnode.children, elm);

    if (vm) {
        appendVM(vm);
    }
}

function patchCustomElement(n1: VCustomElement, n2: VCustomElement) {
    const elm = (n2.elm = n1.elm!);
    const vm = (n2.vm = n1.vm);

    patchElementAttrsAndProps(n1, n2);

    if (!isUndefined(vm)) {
        // in fallback mode, the allocation will always set children to
        // empty and delegate the real allocation to the slot elements
        allocateCustomElementChildren(n2, vm);
    }

    // in fallback mode, the children will be always empty, so, nothing
    // will happen, but in native, it does allocate the light dom
    patchChildren(elm, n1.children, n2.children);

    if (!isUndefined(vm)) {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(
                isArray(n2.children),
                `Invalid vnode for a custom element, it must have children defined.`
            );
        }
        // this will probably update the shadowRoot, but only if the vm is in a dirty state
        // this is important to preserve the top to bottom synchronous rendering phase.
        rerenderVM(vm);
    }
}

function unmount(vnode: VNode, parent: ParentNode) {
    removeVNode(vnode, parent);

    switch (vnode.type) {
        case VNodeType.Element:
            unmountChildren(vnode.children, vnode.elm!);
            break;

        case VNodeType.CustomElement: {
            const { vm } = vnode;

            // No need to unmount the children here, `removeVM` will take care of removing the
            // children.
            if (!isUndefined(vm)) {
                removeVM(vm);
            }
        }
    }
}

function unmountChildren(children: VNodes, parent: ParentNode) {
    for (let i = 0; i < children.length; ++i) {
        const child = children[i];

        if (child != null) {
            unmount(child, parent);
        }
    }
}

function linkNodeToShadow(elm: Node, owner: VM) {
    const { renderer, renderMode, shadowMode } = owner;

    // TODO [#1164]: this should eventually be done by the polyfill directly
    if (renderer.isSyntheticShadowDefined) {
        if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
            (elm as any)[KEY__SHADOW_RESOLVER] = getRenderRoot(owner)[KEY__SHADOW_RESOLVER];
        }
    }
}

function patchElementAttrsAndProps(oldVnode: VBaseElement | null, vnode: VBaseElement) {
    if (isNull(oldVnode)) {
        applyEventListeners(vnode);
        applyStaticClassAttribute(vnode);
        applyStaticStyleAttribute(vnode);
    }

    // Attrs need to be applied to element before props IE11 will wipe out value on radio inputs if
    // value is set before type=radio.
    patchAttributes(oldVnode, vnode);
    patchProps(oldVnode, vnode);
    patchClassAttribute(oldVnode, vnode);
    patchStyleAttribute(oldVnode, vnode);
}

function applyStyleScoping(elm: Element, vnode: VBaseElement) {
    const { cmpTemplate, context, renderer, shadowMode } = vnode.owner;

    // Apply synthetic shadow dom style scoping.
    if (shadowMode === ShadowMode.Synthetic) {
        (elm as any).$shadowToken$ = context.stylesheetToken;
    }

    // Apply light DOM style scoping.
    const scopedStyleToken = cmpTemplate!.stylesheetToken;
    if (context.hasScopedStyles && !isUndefined(scopedStyleToken)) {
        renderer.getClassList(elm).add(scopedStyleToken);
    }
}

// FIXME: This function shouldn't be exported.
export function allocateCustomElementChildren(vnode: VCustomElement, vm: VM) {
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

function allocateInSlot(vm: VM, children: VNodes) {
    const { cmpSlots: oldSlots } = vm;
    const cmpSlots = (vm.cmpSlots = create(null));
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (isNull(vnode)) {
            continue;
        }
        const { data } = vnode;
        const slotName = (data.attrs?.slot ?? '') as string;
        const vnodes = (cmpSlots[slotName] = cmpSlots[slotName] || []);
        // re-keying the vnodes is necessary to avoid conflicts with default content for the slot
        // which might have similar keys. Each vnode will always have a key that
        // starts with a numeric character from compiler. In this case, we add a unique
        // notation for slotted vnodes keys, e.g.: `@foo:1:1`
        if (!isUndefined(vnode.key)) {
            vnode.key = `@${slotName}:${vnode.key}`;
        }
        ArrayPush.call(vnodes, vnode);
    }
    if (!vm.isDirty) {
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

function mountChildren(children: VNodes, parent: Element) {
    for (let i = 0; i < children.length; ++i) {
        const child = children[i];
        if (child != null) {
            patch(null, child, parent, null);
        }
    }
}

function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function isVNode(vnode: any): vnode is VNode {
    return vnode != null;
}

function createKeyToOldIdx(children: VNodes, beginIdx: number, endIdx: number): KeyToIndexMap {
    const map: KeyToIndexMap = {};
    let j: number, key: Key | undefined, ch;
    // TODO [#1637]: simplify this by assuming that all vnodes has keys
    for (j = beginIdx; j <= endIdx; ++j) {
        ch = children[j];
        if (isVNode(ch)) {
            key = ch.key;
            if (key !== undefined) {
                map[key] = j;
            }
        }
    }
    return map;
}

function addVnodes(
    parentElm: ParentNode,
    before: Node | null,
    vnodes: VNodes,
    startIdx: number,
    endIdx: number
) {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        if (isVNode(ch)) {
            patch(null, ch, parentElm, before);
        }
    }
}

function removeVnodes(
    parentElm: ParentNode,
    vnodes: VNodes,
    startIdx: number,
    endIdx: number
): void {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnodes[startIdx];
        // text nodes do not have logic associated to them
        if (isVNode(ch)) {
            unmount(ch, parentElm);
        }
    }
}

function updateDynamicChildren(parentElm: ParentNode, oldCh: VNodes, newCh: VNodes) {
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
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartVnode, newStartVnode, parentElm, null);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode, parentElm, null);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            patch(oldStartVnode, newEndVnode, parentElm, null);
            insertVNode(
                oldStartVnode,
                parentElm,
                oldEndVnode.owner.renderer.nextSibling(oldEndVnode.elm!)
            );
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            patch(oldEndVnode, newStartVnode, parentElm, null);
            insertVNode(oldEndVnode, parentElm, oldStartVnode.elm!);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            }
            idxInOld = oldKeyToIdx[newStartVnode.key!];
            if (isUndefined(idxInOld)) {
                // New element
                patch(null, newStartVnode, parentElm, oldStartVnode.elm!);
                newStartVnode = newCh[++newStartIdx];
            } else {
                elmToMove = oldCh[idxInOld];
                if (isVNode(elmToMove)) {
                    if (elmToMove.sel !== newStartVnode.sel) {
                        // New element
                        patch(null, newStartVnode, parentElm, oldStartVnode.elm!);
                    } else {
                        patch(elmToMove, newStartVnode, parentElm, null);
                        oldCh[idxInOld] = undefined as any;
                        insertVNode(elmToMove, parentElm, oldStartVnode.elm!);
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

function updateStaticChildren(parentElm: ParentNode, oldCh: VNodes, newCh: VNodes) {
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
                    patch(oldVNode, vnode, parentElm, null);
                    referenceElm = vnode.elm!;
                } else {
                    // removing the old vnode since the new one is null
                    unmount(oldVNode, parentElm);
                }
            } else if (isVNode(vnode)) {
                // this condition is unnecessary
                // insert the new node one since the old one is nul
                patch(null, vnode, parentElm, referenceElm);
                referenceElm = vnode.elm!;
            }
        }
    }
}

function updateTextContent(vnode: VNode) {
    const {
        elm,
        text,
        owner: { renderer },
    } = vnode;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.setText(elm, text!);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function insertVNode(vnode: VNode, parentNode: Node, referenceNode: Node | null) {
    const { renderer } = vnode.owner;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.insert(vnode.elm!, parentNode, referenceNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function removeVNode(vnode: VNode, parentNode: Node) {
    const { renderer } = vnode.owner;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.remove(vnode.elm!, parentNode);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}
