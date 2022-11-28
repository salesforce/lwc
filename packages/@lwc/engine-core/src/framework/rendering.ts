/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    ArraySome,
    assert,
    create,
    isArray,
    isFalse,
    isNull,
    isTrue,
    isUndefined,
    KEY__SHADOW_RESOLVER,
    KEY__SHADOW_STATIC,
    keys,
    SVG_NAMESPACE,
} from '@lwc/shared';
import features from '@lwc/features';

import { logError } from '../shared/logger';
import { getComponentTag } from '../shared/format';
import { LifecycleCallback, RendererAPI } from './renderer';
import { EmptyArray } from './utils';
import { markComponentAsDirty } from './component';
import { getScopeTokenClass } from './stylesheet';
import { lockDomMutation, patchElementWithRestrictions, unlockDomMutation } from './restrictions';
import {
    appendVM,
    connectRootElement,
    createVM,
    disconnectRootElement,
    getAssociatedVMIfPresent,
    LwcDomMode,
    removeVM,
    RenderMode,
    rerenderVM,
    runConnectedCallback,
    ShadowMode,
    VM,
    VMState,
} from './vm';
import {
    isSameVnode,
    isVBaseElement,
    isVFragment,
    isVScopedSlotFragment,
    Key,
    VBaseElement,
    VComment,
    VCustomElement,
    VElement,
    VFragment,
    VNode,
    VNodes,
    VNodeType,
    VStatic,
    VText,
} from './vnodes';

import { patchAttributes } from './modules/attrs';
import { patchAttrUnlessProp } from './modules/attr-unless-prop';
import { patchProps } from './modules/props';
import { patchClassAttribute } from './modules/computed-class-attr';
import { patchStyleAttribute } from './modules/computed-style-attr';
import { applyEventListeners } from './modules/events';
import { applyStaticClassAttribute } from './modules/static-class-attr';
import { applyStaticStyleAttribute } from './modules/static-style-attr';

export function patchChildren(
    c1: VNodes,
    c2: VNodes,
    parent: ParentNode,
    renderer: RendererAPI
): void {
    if (hasDynamicChildren(c2)) {
        updateDynamicChildren(c1, c2, parent, renderer);
    } else {
        updateStaticChildren(c1, c2, parent, renderer);
    }
}

function patch(n1: VNode, n2: VNode, parent: ParentNode, renderer: RendererAPI) {
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
            // VText has no special capability, fallback to the owner's renderer
            patchText(n1 as VText, n2, renderer);
            break;

        case VNodeType.Comment:
            // VComment has no special capability, fallback to the owner's renderer
            patchComment(n1 as VComment, n2, renderer);
            break;

        case VNodeType.Static:
            n2.elm = n1.elm;
            break;

        case VNodeType.Fragment:
            patchFragment(n1 as VFragment, n2, parent, renderer);
            break;

        case VNodeType.Element:
            patchElement(n1 as VElement, n2, n2.data.renderer ?? renderer);
            break;

        case VNodeType.CustomElement:
            patchCustomElement(n1 as VCustomElement, n2, parent, n2.data.renderer ?? renderer);
            break;
    }
}

export function mount(node: VNode, parent: ParentNode, renderer: RendererAPI, anchor: Node | null) {
    switch (node.type) {
        case VNodeType.Text:
            // VText has no special capability, fallback to the owner's renderer
            mountText(node, parent, anchor, renderer);
            break;

        case VNodeType.Comment:
            // VComment has no special capability, fallback to the owner's renderer
            mountComment(node, parent, anchor, renderer);
            break;

        case VNodeType.Static:
            // VStatic cannot have a custom renderer associated to them, using owner's renderer
            mountStatic(node, parent, anchor, renderer);
            break;

        case VNodeType.Fragment:
            mountFragment(node, parent, anchor, renderer);
            break;

        case VNodeType.Element:
            // If the vnode data has a renderer override use it, else fallback to owner's renderer
            mountElement(node, parent, anchor, node.data.renderer ?? renderer);
            break;

        case VNodeType.CustomElement:
            // If the vnode data has a renderer override use it, else fallback to owner's renderer
            mountCustomElement(node, parent, anchor, node.data.renderer ?? renderer);
            break;
    }
}

function patchText(n1: VText, n2: VText, renderer: RendererAPI) {
    n2.elm = n1.elm;

    if (n2.text !== n1.text) {
        updateTextContent(n2, renderer);
    }
}

function mountText(vnode: VText, parent: ParentNode, anchor: Node | null, renderer: RendererAPI) {
    const { owner } = vnode;
    const { createText } = renderer;

    const textNode = (vnode.elm = createText(vnode.text));
    linkNodeToShadow(textNode, owner, renderer);

    insertNode(textNode, parent, anchor, renderer);
}

function patchComment(n1: VComment, n2: VComment, renderer: RendererAPI) {
    n2.elm = n1.elm;

    // FIXME: Comment nodes should be static, we shouldn't need to diff them together. However
    // it is the case today.
    if (n2.text !== n1.text) {
        updateTextContent(n2, renderer);
    }
}

function mountComment(
    vnode: VComment,
    parent: ParentNode,
    anchor: Node | null,
    renderer: RendererAPI
) {
    const { owner } = vnode;
    const { createComment } = renderer;

    const commentNode = (vnode.elm = createComment(vnode.text));
    linkNodeToShadow(commentNode, owner, renderer);

    insertNode(commentNode, parent, anchor, renderer);
}

function mountFragment(
    vnode: VFragment,
    parent: ParentNode,
    anchor: Node | null,
    renderer: RendererAPI
) {
    const { children } = vnode;
    mountVNodes(children, parent, renderer, anchor);

    // children of a fragment will always have at least the two delimiters.
    vnode.elm = children[children.length - 1]!.elm;
}

function patchFragment(n1: VFragment, n2: VFragment, parent: ParentNode, renderer: RendererAPI) {
    const { children, stable } = n2;

    if (stable) {
        updateStaticChildren(n1.children, children, parent, renderer);
    } else {
        updateDynamicChildren(n1.children, children, parent, renderer);
    }

    // Note: not reusing n1.elm, because during patching, it may be patched with another text node.
    n2.elm = children[children.length - 1]!.elm;
}

function mountElement(
    vnode: VElement,
    parent: ParentNode,
    anchor: Node | null,
    renderer: RendererAPI
) {
    const {
        sel,
        owner,
        data: { svg },
    } = vnode;
    const { createElement } = renderer;

    const namespace = isTrue(svg) ? SVG_NAMESPACE : undefined;
    const elm = (vnode.elm = createElement(sel, namespace));

    linkNodeToShadow(elm, owner, renderer);
    applyStyleScoping(elm, owner, renderer);
    applyDomManual(elm, vnode);
    applyElementRestrictions(elm, vnode);

    patchElementPropsAndAttrs(null, vnode, renderer);

    insertNode(elm, parent, anchor, renderer);
    mountVNodes(vnode.children, elm, renderer, null);
}

function patchElement(n1: VElement, n2: VElement, renderer: RendererAPI) {
    const elm = (n2.elm = n1.elm!);

    patchElementPropsAndAttrs(n1, n2, renderer);
    patchChildren(n1.children, n2.children, elm, renderer);
}

function mountStatic(
    vnode: VStatic,
    parent: ParentNode,
    anchor: Node | null,
    renderer: RendererAPI
) {
    const { owner } = vnode;
    const { cloneNode, isSyntheticShadowDefined } = renderer;
    const elm = (vnode.elm = cloneNode(vnode.fragment, true));

    linkNodeToShadow(elm, owner, renderer);
    applyElementRestrictions(elm, vnode);

    // Marks this node as Static to propagate the shadow resolver. must happen after elm is assigned to the proper shadow
    const { renderMode, shadowMode } = owner;

    if (isSyntheticShadowDefined) {
        if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
            (elm as any)[KEY__SHADOW_STATIC] = true;
        }
    }

    insertNode(elm, parent, anchor, renderer);
}

function mountCustomElement(
    vnode: VCustomElement,
    parent: ParentNode,
    anchor: Node | null,
    renderer: RendererAPI
) {
    const { sel, owner } = vnode;
    const { createCustomElement } = renderer;
    /**
     * Note: if the upgradable constructor does not expect, or throw when we new it
     * with a callback as the first argument, we could implement a more advanced
     * mechanism that only passes that argument if the constructor is known to be
     * an upgradable custom element.
     */
    let vm: VM | undefined;

    const upgradeCallback = (elm: HTMLElement) => {
        // the custom element from the registry is expecting an upgrade callback
        vm = createViewModelHook(elm, vnode, renderer);
    };

    let connectedCallback: LifecycleCallback | undefined;
    let disconnectedCallback: LifecycleCallback | undefined;

    if (features.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
        connectedCallback = (elm: HTMLElement) => {
            connectRootElement(elm);
        };
        disconnectedCallback = (elm: HTMLElement) => {
            disconnectRootElement(elm);
        };
    }

    // Should never get a tag with upper case letter at this point; the compiler
    // should produce only tags with lowercase letters. However, the Java
    // compiler may generate tagnames with uppercase letters so - for backwards
    // compatibility, we lower case the tagname here.
    const normalizedTagname = sel.toLowerCase();
    const elm = createCustomElement(
        normalizedTagname,
        upgradeCallback,
        connectedCallback,
        disconnectedCallback
    );

    vnode.elm = elm;
    vnode.vm = vm;

    linkNodeToShadow(elm, owner, renderer);
    applyStyleScoping(elm, owner, renderer);

    if (vm) {
        allocateChildren(vnode, vm);
    }

    patchElementPropsAndAttrs(null, vnode, renderer);
    insertNode(elm, parent, anchor, renderer);

    if (vm) {
        if (process.env.IS_BROWSER) {
            if (!features.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
                if (process.env.NODE_ENV !== 'production') {
                    // With synthetic lifecycle callbacks, it's possible for elements to be removed without the engine
                    // noticing it (e.g. `appendChild` the same host element twice). This test ensures we don't regress.
                    assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
                }
                runConnectedCallback(vm);
            }
        } else {
            // On the server, we don't have native custom element lifecycle callbacks, so we must
            // manually invoke the connectedCallback for a child component.
            runConnectedCallback(vm);
        }
    }

    mountVNodes(vnode.children, elm, renderer, null);

    if (vm) {
        appendVM(vm);
    }
}

function patchCustomElement(
    n1: VCustomElement,
    n2: VCustomElement,
    parent: ParentNode,
    renderer: RendererAPI
) {
    if (n1.ctor !== n2.ctor) {
        // If the constructor, unmount the current component and mount a new one using the new
        // constructor.
        const anchor = renderer.nextSibling(n1.elm);

        unmount(n1, parent, renderer, true);
        mountCustomElement(n2, parent, anchor, renderer);
    } else {
        // Otherwise patch the existing component with new props/attrs/etc.
        const elm = (n2.elm = n1.elm!);
        const vm = (n2.vm = n1.vm);

        patchElementPropsAndAttrs(n1, n2, renderer);
        if (!isUndefined(vm)) {
            // in fallback mode, the allocation will always set children to
            // empty and delegate the real allocation to the slot elements
            allocateChildren(n2, vm);
        }

        // in fallback mode, the children will be always empty, so, nothing
        // will happen, but in native, it does allocate the light dom
        patchChildren(n1.children, n2.children, elm, renderer);

        if (!isUndefined(vm)) {
            // this will probably update the shadowRoot, but only if the vm is in a dirty state
            // this is important to preserve the top to bottom synchronous rendering phase.
            rerenderVM(vm);
        }
    }
}

function mountVNodes(
    vnodes: VNodes,
    parent: ParentNode,
    renderer: RendererAPI,
    anchor: Node | null,
    start: number = 0,
    end: number = vnodes.length
) {
    for (; start < end; ++start) {
        const vnode = vnodes[start];
        if (isVNode(vnode)) {
            mount(vnode, parent, renderer, anchor);
        }
    }
}

function unmount(
    vnode: VNode,
    parent: ParentNode,
    renderer: RendererAPI,
    doRemove: boolean = false
) {
    const { type, elm, sel } = vnode;

    // When unmounting a VNode subtree not all the elements have to removed from the DOM. The
    // subtree root, is the only element worth unmounting from the subtree.
    if (doRemove) {
        if (type === VNodeType.Fragment) {
            unmountVNodes(vnode.children, parent, renderer, doRemove);
        } else {
            // The vnode might or might not have a data.renderer associated to it
            // but the removal used here is from the owner instead.
            removeNode(elm!, parent, renderer);
        }
    }

    switch (type) {
        case VNodeType.Element: {
            // Slot content is removed to trigger slotchange event when removing slot.
            // Only required for synthetic shadow.
            const shouldRemoveChildren =
                sel === 'slot' && vnode.owner.shadowMode === ShadowMode.Synthetic;
            unmountVNodes(vnode.children, elm as ParentNode, renderer, shouldRemoveChildren);
            break;
        }

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

function unmountVNodes(
    vnodes: VNodes,
    parent: ParentNode,
    renderer: RendererAPI,
    doRemove: boolean = false,
    start: number = 0,
    end: number = vnodes.length
) {
    for (; start < end; ++start) {
        const ch = vnodes[start];
        if (isVNode(ch)) {
            unmount(ch, parent, renderer, doRemove);
        }
    }
}

function isVNode(vnode: any): vnode is VNode {
    return vnode != null;
}

function linkNodeToShadow(elm: Node, owner: VM, renderer: RendererAPI) {
    const { renderRoot, renderMode, shadowMode } = owner;
    const { isSyntheticShadowDefined } = renderer;
    // TODO [#1164]: this should eventually be done by the polyfill directly
    if (isSyntheticShadowDefined) {
        if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
            (elm as any)[KEY__SHADOW_RESOLVER] = renderRoot[KEY__SHADOW_RESOLVER];
        }
    }
}

function updateTextContent(vnode: VText | VComment, renderer: RendererAPI) {
    const { elm, text } = vnode;
    const { setText } = renderer;

    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    setText(elm, text!);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function insertNode(node: Node, parent: Node, anchor: Node | null, renderer: RendererAPI) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.insert(node, parent, anchor);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

export function removeNode(node: Node, parent: ParentNode, renderer: RendererAPI) {
    if (process.env.NODE_ENV !== 'production') {
        unlockDomMutation();
    }
    renderer.remove(node, parent);
    if (process.env.NODE_ENV !== 'production') {
        lockDomMutation();
    }
}

function patchElementPropsAndAttrs(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI
) {
    if (isNull(oldVnode)) {
        applyEventListeners(vnode, renderer);
        applyStaticClassAttribute(vnode, renderer);
        applyStaticStyleAttribute(vnode, renderer);
    }

    // Attrs need to be applied to element before props IE11 will wipe out value on radio inputs if
    // value is set before type=radio.
    patchClassAttribute(oldVnode, vnode, renderer);
    patchStyleAttribute(oldVnode, vnode, renderer);

    if (vnode.data.external) {
        patchAttrUnlessProp(oldVnode, vnode, renderer);
    } else {
        patchAttributes(oldVnode, vnode, renderer);
    }

    patchProps(oldVnode, vnode, renderer);
}

function applyStyleScoping(elm: Element, owner: VM, renderer: RendererAPI) {
    // Set the class name for `*.scoped.css` style scoping.
    const scopeToken = getScopeTokenClass(owner);
    if (!isNull(scopeToken)) {
        const { getClassList } = renderer;
        // TODO [#2762]: this dot notation with add is probably problematic
        // probably we should have a renderer api for just the add operation
        getClassList(elm).add(scopeToken);
    }

    // Set property element for synthetic shadow DOM style scoping.
    const { stylesheetToken: syntheticToken } = owner.context;
    if (owner.shadowMode === ShadowMode.Synthetic && !isUndefined(syntheticToken)) {
        (elm as any).$shadowToken$ = syntheticToken;
    }
}

function applyDomManual(elm: Element, vnode: VBaseElement) {
    const {
        owner,
        data: { context },
    } = vnode;
    if (owner.shadowMode === ShadowMode.Synthetic && context?.lwc?.dom === LwcDomMode.Manual) {
        (elm as any).$domManual$ = true;
    }
}

function applyElementRestrictions(elm: Element, vnode: VElement | VStatic) {
    if (process.env.NODE_ENV !== 'production') {
        const isSynthetic = vnode.owner.shadowMode === ShadowMode.Synthetic;
        const isPortal =
            vnode.type === VNodeType.Element && vnode.data.context?.lwc?.dom === LwcDomMode.Manual;
        const isLight = vnode.owner.renderMode === RenderMode.Light;
        patchElementWithRestrictions(elm, {
            isPortal,
            isLight,
            isSynthetic,
        });
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
    if (process.env.NODE_ENV !== 'production') {
        // If any of the children being allocated is a scoped slot fragment, make sure the receiving
        // component is a light DOM component. This is mainly to validate light dom parent running
        // in native shadow mode.
        if (
            renderMode !== RenderMode.Light &&
            ArraySome.call(children, (child) => !isNull(child) && isVScopedSlotFragment(child))
        ) {
            logError(
                `Invalid usage of 'lwc:slot-data' on ${getComponentTag(
                    vm
                )} tag. Scoped slot content can only be passed to a light dom child.`
            );
        }
    }
    if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
        // slow path
        allocateInSlot(vm, children, vnode.owner);
        // save the allocated children in case this vnode is reused.
        vnode.aChildren = children;
        // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
        vnode.children = EmptyArray;
    }
}

function createViewModelHook(elm: HTMLElement, vnode: VCustomElement, renderer: RendererAPI): VM {
    let vm = getAssociatedVMIfPresent(elm);

    // There is a possibility that a custom element is registered under tagName, in which case, the
    // initialization is already carry on, and there is nothing else to do here since this hook is
    // called right after invoking `document.createElement`.
    if (!isUndefined(vm)) {
        return vm;
    }

    const { sel, mode, ctor, owner } = vnode;
    vm = createVM(elm, ctor, renderer, {
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

/**
 * Collects all slots into a SlotSet, traversing through VFragment Nodes
 */
function collectSlots(vm: VM, children: VNodes, cmpSlotsMapping: { [key: string]: VNodes }) {
    for (let i = 0, len = children.length; i < len; i += 1) {
        const vnode = children[i];
        if (isNull(vnode)) {
            continue;
        }

        // Dive further iff the content is wrapped in a VFragment
        if (isVFragment(vnode)) {
            // Remove the text delimiter nodes to avoid overriding default slot content
            collectSlots(vm, vnode.children.slice(1, -1), cmpSlotsMapping);
            continue;
        }

        let slotName = '';
        if (isVBaseElement(vnode)) {
            slotName = (vnode.data.attrs?.slot as string) ?? '';
        } else if (isVScopedSlotFragment(vnode)) {
            slotName = vnode.slotName;
        }

        const vnodes: VNodes = (cmpSlotsMapping[slotName] = cmpSlotsMapping[slotName] || []);
        ArrayPush.call(vnodes, vnode);
    }
}

function allocateInSlot(vm: VM, children: VNodes, owner: VM) {
    const {
        cmpSlots: { slotAssignments: oldSlotsMapping },
    } = vm;
    const cmpSlotsMapping = create(null);
    collectSlots(vm, children, cmpSlotsMapping);
    vm.cmpSlots = { owner, slotAssignments: cmpSlotsMapping };
    if (isFalse(vm.isDirty)) {
        // We need to determine if the old allocation is really different from the new one
        // and mark the vm as dirty
        const oldKeys = keys(oldSlotsMapping);
        if (oldKeys.length !== keys(cmpSlotsMapping).length) {
            markComponentAsDirty(vm);
            return;
        }
        for (let i = 0, len = oldKeys.length; i < len; i += 1) {
            const key = oldKeys[i];
            if (
                isUndefined(cmpSlotsMapping[key]) ||
                oldSlotsMapping[key].length !== cmpSlotsMapping[key].length
            ) {
                markComponentAsDirty(vm);
                return;
            }
            const oldVNodes = oldSlotsMapping[key];
            const vnodes = cmpSlotsMapping[key];
            for (let j = 0, a = cmpSlotsMapping[key].length; j < a; j += 1) {
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

function updateDynamicChildren(
    oldCh: VNodes,
    newCh: VNodes,
    parent: ParentNode,
    renderer: RendererAPI
) {
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
            patch(oldStartVnode, newStartVnode, parent, renderer);
            oldStartVnode = oldCh[++oldStartIdx];
            newStartVnode = newCh[++newStartIdx];
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode, parent, renderer);
            oldEndVnode = oldCh[--oldEndIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // Vnode moved right
            patch(oldStartVnode, newEndVnode, parent, renderer);
            insertNode(
                oldStartVnode.elm!,
                parent,
                renderer.nextSibling(oldEndVnode.elm!),
                renderer
            );
            oldStartVnode = oldCh[++oldStartIdx];
            newEndVnode = newCh[--newEndIdx];
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // Vnode moved left
            patch(oldEndVnode, newStartVnode, parent, renderer);
            insertNode(newStartVnode.elm!, parent, oldStartVnode.elm!, renderer);
            oldEndVnode = oldCh[--oldEndIdx];
            newStartVnode = newCh[++newStartIdx];
        } else {
            if (oldKeyToIdx === undefined) {
                oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
            }
            idxInOld = oldKeyToIdx[newStartVnode.key!];
            if (isUndefined(idxInOld)) {
                // New element
                mount(newStartVnode, parent, renderer, oldStartVnode.elm!);
                newStartVnode = newCh[++newStartIdx];
            } else {
                elmToMove = oldCh[idxInOld];
                if (isVNode(elmToMove)) {
                    if (elmToMove.sel !== newStartVnode.sel) {
                        // New element
                        mount(newStartVnode, parent, renderer, oldStartVnode.elm!);
                    } else {
                        patch(elmToMove, newStartVnode, parent, renderer);
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
                        insertNode(elmToMove.elm!, parent, oldStartVnode.elm!, renderer);
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
            mountVNodes(newCh, parent, renderer, before, newStartIdx, newEndIdx + 1);
        } else {
            unmountVNodes(oldCh, parent, renderer, true, oldStartIdx, oldEndIdx + 1);
        }
    }
}

function updateStaticChildren(c1: VNodes, c2: VNodes, parent: ParentNode, renderer: RendererAPI) {
    const c1Length = c1.length;
    const c2Length = c2.length;

    if (c1Length === 0) {
        // the old list is empty, we can directly insert anything new
        mountVNodes(c2, parent, renderer, null);
        return;
    }

    if (c2Length === 0) {
        // the old list is nonempty and the new list is empty so we can directly remove all old nodes
        // this is the case in which the dynamic children of an if-directive should be removed
        unmountVNodes(c1, parent, renderer, true);
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
                    patch(n1, n2, parent, renderer);
                    anchor = n2.elm!;
                } else {
                    // removing the old vnode since the new one is null
                    unmount(n1, parent, renderer, true);
                }
            } else if (isVNode(n2)) {
                mount(n2, parent, renderer, anchor);
                anchor = n2.elm!;
            }
        }
    }
}
