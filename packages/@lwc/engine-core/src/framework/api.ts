/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    APIFeature,
    ArrayPush,
    assert,
    create as ObjectCreate,
    forEach,
    freeze as ObjectFreeze,
    isAPIFeatureEnabled,
    isArray,
    isFalse,
    isFunction,
    isNull,
    isNumber,
    isObject,
    isString,
    isTrue,
    isUndefined,
    StringReplace,
    toString,
    sanitizeHtmlContent,
    normalizeClass,
} from '@lwc/shared';

import { logError } from '../shared/logger';

import { invokeEventListener } from './invoker';
import { getVMBeingRendered, setVMBeingRendered } from './template';
import { EmptyArray } from './utils';
import { isComponentConstructor } from './def';
import { RenderMode, ShadowMode } from './vm';
import { markAsDynamicChildren } from './rendering';
import {
    isVBaseElement,
    isVCustomElement,
    isVScopedSlotFragment,
    isVStatic,
    VNodeType,
    VStaticPartType,
} from './vnodes';
import { getComponentRegisteredName } from './component';
import { createSanitizedHtmlContent } from './sanitized-html-content';
import type { SanitizedHtmlContent } from './sanitized-html-content';
import type {
    Key,
    MutableVNodes,
    VComment,
    VCustomElement,
    VElement,
    VElementData,
    VFragment,
    VNode,
    VNodes,
    VScopedSlotFragment,
    VStatic,
    VStaticPart,
    VStaticPartData,
    VText,
} from './vnodes';
import type { LightningElementConstructor } from './base-lightning-element';
import type { SlotSet, VM } from './vm';

const SymbolIterator: typeof Symbol.iterator = Symbol.iterator;

function addVNodeToChildLWC(vnode: VCustomElement) {
    ArrayPush.call(getVMBeingRendered()!.velements, vnode);
}

// [s]tatic [p]art
function sp(partId: number, data: VStaticPartData | null, text: string | null): VStaticPart {
    // Static part will always have either text or data, it's guaranteed by the compiler.
    const type = isNull(text) ? VStaticPartType.Element : VStaticPartType.Text;
    return {
        type,
        partId,
        data,
        text,
        elm: undefined, // elm is defined later
    };
}

// [s]coped [s]lot [f]actory
function ssf(slotName: unknown, factory: (value: any, key: any) => VFragment): VScopedSlotFragment {
    return {
        type: VNodeType.ScopedSlotFragment,
        factory,
        owner: getVMBeingRendered()!,
        elm: undefined,
        sel: '__scoped_slot_fragment__',
        key: undefined,
        slotName,
    };
}

// [st]atic node
function st(
    fragmentFactory: (parts?: VStaticPart[]) => Element,
    key: Key,
    parts?: VStaticPart[]
): VStatic {
    const owner = getVMBeingRendered()!;
    const fragment = fragmentFactory(parts);
    const vnode: VStatic = {
        type: VNodeType.Static,
        sel: '__static__',
        key,
        elm: undefined,
        fragment,
        owner,
        parts,
        slotAssignment: undefined,
    };

    return vnode;
}

// [fr]agment node
function fr(key: Key, children: VNodes, stable: 0 | 1): VFragment {
    const owner = getVMBeingRendered()!;
    const useCommentNodes = isAPIFeatureEnabled(
        APIFeature.USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
        owner.apiVersion
    );

    const leading = useCommentNodes ? co('') : t('');
    const trailing = useCommentNodes ? co('') : t('');

    return {
        type: VNodeType.Fragment,
        sel: '__fragment__',
        key,
        elm: undefined,
        children: [leading, ...children, trailing],
        stable,
        owner,
        leading,
        trailing,
    };
}

// [h]tml node
function h(sel: string, data: VElementData, children: VNodes = EmptyArray): VElement {
    const vmBeingRendered = getVMBeingRendered()!;
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `h() 1st argument sel must be a string.`);
        assert.isTrue(isObject(data), `h() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
        assert.isTrue(
            'key' in data,
            ` <${sel}> "key" attribute is invalid or missing for ${vmBeingRendered}. Key inside iterator is either undefined or null.`
        );
        // checking reserved internal data properties
        assert.isFalse(
            data.className && data.classMap,
            `vnode.data.className and vnode.data.classMap ambiguous declaration.`
        );
        assert.isFalse(
            data.styleDecls && data.style,
            `vnode.data.styleDecls and vnode.data.style ambiguous declaration.`
        );

        forEach.call(children, (childVnode: VNode | null | undefined) => {
            if (childVnode != null) {
                assert.isTrue(
                    'type' in childVnode &&
                        'sel' in childVnode &&
                        'elm' in childVnode &&
                        'key' in childVnode,
                    `${childVnode} is not a vnode.`
                );
            }
        });
    }

    const { key, slotAssignment } = data;

    const vnode: VElement = {
        type: VNodeType.Element,
        sel,
        data,
        children,
        elm: undefined,
        key,
        owner: vmBeingRendered,
        slotAssignment,
    };

    return vnode;
}

// [t]ab[i]ndex function
function ti(value: any): number {
    // if value is greater than 0, we normalize to 0
    // If value is an invalid tabIndex value (null, undefined, string, etc), we let that value pass through
    // If value is less than -1, we don't care
    const shouldNormalize = value > 0 && !(isTrue(value) || isFalse(value));
    if (process.env.NODE_ENV !== 'production') {
        const vmBeingRendered = getVMBeingRendered();
        if (shouldNormalize) {
            logError(
                `Invalid tabindex value \`${toString(
                    value
                )}\` in template for ${vmBeingRendered}. This attribute must be set to 0 or -1.`,
                vmBeingRendered!
            );
        }
    }
    return shouldNormalize ? 0 : value;
}

// [s]lot element node
function s(
    slotName: string,
    data: VElementData,
    children: VNodes,
    slotset: SlotSet | undefined
): VElement | VNodes | VFragment {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(slotName), `s() 1st argument slotName must be a string.`);
        assert.isTrue(isObject(data), `s() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
    }

    const vmBeingRendered = getVMBeingRendered()!;
    const { renderMode, apiVersion } = vmBeingRendered;

    if (
        !isUndefined(slotset) &&
        !isUndefined(slotset.slotAssignments) &&
        !isUndefined(slotset.slotAssignments[slotName]) &&
        slotset.slotAssignments[slotName].length !== 0
    ) {
        const newChildren: VNode[] = [];
        const slotAssignments = slotset.slotAssignments[slotName];
        for (let i = 0; i < slotAssignments.length; i++) {
            const vnode = slotAssignments[i];
            if (!isNull(vnode)) {
                const assignedNodeIsScopedSlot = isVScopedSlotFragment(vnode);
                // The only sniff test for a scoped <slot> element is the presence of `slotData`
                const isScopedSlotElement = !isUndefined(data.slotData);
                // Check if slot types of parent and child are matching
                if (assignedNodeIsScopedSlot !== isScopedSlotElement) {
                    if (process.env.NODE_ENV !== 'production') {
                        logError(
                            `Mismatched slot types for ${
                                slotName === '' ? '(default)' : slotName
                            } slot. Both parent and child component must use standard type or scoped type for a given slot.`,
                            slotset.owner
                        );
                    }
                    // Ignore slot content from parent
                    continue;
                }
                // If the passed slot content is factory, evaluate it and add the produced vnodes
                if (assignedNodeIsScopedSlot) {
                    // Evaluate in the scope of the slot content's owner
                    // if a slotset is provided, there will always be an owner. The only case where owner is
                    // undefined is for root components, but root components cannot accept slotted content
                    setVMBeingRendered(slotset.owner!);
                    try {
                        // The factory function is a template snippet from the slot set owner's template,
                        // hence switch over to the slot set owner's template reactive observer
                        const { tro } = slotset.owner!;
                        tro.observe(() => {
                            ArrayPush.call(newChildren, vnode.factory(data.slotData, data.key));
                        });
                    } finally {
                        setVMBeingRendered(vmBeingRendered);
                    }
                } else {
                    // This block is for standard slots (non-scoped slots)
                    let clonedVNode;
                    if (
                        renderMode === RenderMode.Light &&
                        isAPIFeatureEnabled(APIFeature.USE_LIGHT_DOM_SLOT_FORWARDING, apiVersion) &&
                        (isVBaseElement(vnode) || isVStatic(vnode)) &&
                        vnode.slotAssignment !== data.slotAssignment
                    ) {
                        // When the light DOM slot assignment (slot attribute) changes, we can't use the same reference
                        // to the vnode because the current way the diffing algo works, it will replace the original
                        // reference to the host element with a new one. This means the new element will be mounted and
                        // immediately unmounted. Creating a copy of the vnode preserves a reference to the previous
                        // host element.
                        clonedVNode = { ...vnode, slotAssignment: data.slotAssignment };
                        // For disconnectedCallback to work correctly in synthetic lifecycle mode, we need to link the
                        // current VM's velements to the clone, so that when the VM unmounts, the clone also unmounts.
                        // Note this only applies to VCustomElements, since those are the elements that we manually need
                        // to call disconnectedCallback for, when running in synthetic lifecycle mode.
                        //
                        // You might think it would make more sense to add the clonedVNode to the same velements array
                        // as the original vnode's VM (i.e. `vnode.owner.velements`) rather than the current VM (i.e.
                        // `vmBeingRendered.velements`), but this actually might not trigger disconnectedCallback
                        // in synthetic lifecycle mode. The reason for this is that a reactivity change may cause
                        // the slottable component to unmount, but _not_ the slotter component (see issue #4446).
                        //
                        // If this occurs, then the slottable component (i.e .this component we are rendering right
                        // now) is the one that needs to own the clone. Whereas if a reactivity change higher in the
                        // tree causes the slotter to unmount, then the slottable will also unmount. So using the
                        // current VM works either way.
                        if (isVCustomElement(vnode)) {
                            addVNodeToChildLWC(clonedVNode as VCustomElement);
                        }
                    }
                    // If the slot content is standard type, the content is static, no additional
                    // processing needed on the vnode
                    ArrayPush.call(newChildren, clonedVNode ?? vnode);
                }
            }
        }
        children = newChildren;
    }
    const { shadowMode } = vmBeingRendered;

    if (renderMode === RenderMode.Light) {
        // light DOM slots - backwards-compatible behavior uses flattening, new behavior uses fragments
        if (isAPIFeatureEnabled(APIFeature.USE_FRAGMENTS_FOR_LIGHT_DOM_SLOTS, apiVersion)) {
            return fr(data.key, children, 0);
        } else {
            sc(children);
            return children;
        }
    }
    if (shadowMode === ShadowMode.Synthetic) {
        // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic
        sc(children);
    }
    return h('slot', data, children);
}

// [c]ustom element node
function c(
    sel: string,
    Ctor: LightningElementConstructor,
    data: VElementData,
    children: VNodes = EmptyArray
): VCustomElement {
    const vmBeingRendered = getVMBeingRendered()!;
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
        assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
        assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
        assert.isTrue(
            arguments.length === 3 || isArray(children),
            `c() 4nd argument data must be an array.`
        );
        // checking reserved internal data properties
        assert.isFalse(
            data.className && data.classMap,
            `vnode.data.className and vnode.data.classMap ambiguous declaration.`
        );
        assert.isFalse(
            data.styleDecls && data.style,
            `vnode.data.styleDecls and vnode.data.style ambiguous declaration.`
        );
        if (data.style && !isString(data.style)) {
            logError(
                `Invalid 'style' attribute passed to <${sel}> is ignored. This attribute must be a string value.`,
                vmBeingRendered
            );
        }
        if (arguments.length === 4) {
            forEach.call(children, (childVnode: VNode | null | undefined) => {
                if (childVnode != null) {
                    assert.isTrue(
                        'type' in childVnode &&
                            'sel' in childVnode &&
                            'elm' in childVnode &&
                            'key' in childVnode,
                        `${childVnode} is not a vnode.`
                    );
                }
            });
        }
    }

    const { key, slotAssignment } = data;
    let elm, aChildren, vm;
    const vnode: VCustomElement = {
        type: VNodeType.CustomElement,
        sel,
        data,
        children,
        elm,
        key,
        slotAssignment,

        ctor: Ctor,
        owner: vmBeingRendered,
        mode: 'open', // TODO [#1294]: this should be defined in Ctor
        aChildren,
        vm,
    };
    addVNodeToChildLWC(vnode);

    return vnode;
}

// [i]terable node
function i(
    iterable: Iterable<any>,
    factory: (value: any, index: number, first: boolean, last: boolean) => VNodes | VNode
): VNodes {
    const list: MutableVNodes = [];
    // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic
    sc(list);
    const vmBeingRendered = getVMBeingRendered()!;
    if (isUndefined(iterable) || isNull(iterable)) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Invalid template iteration for value \`${toString(
                    iterable
                )}\` in ${vmBeingRendered}. It must be an array-like object.`,
                vmBeingRendered!
            );
        }
        return list;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(
            isUndefined(iterable[SymbolIterator]),
            `Invalid template iteration for value \`${toString(
                iterable
            )}\` in ${vmBeingRendered}. It must be an array-like object.`
        );
    }
    const iterator = iterable[SymbolIterator]();

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(
            iterator && isFunction(iterator.next),
            `Invalid iterator function for "${toString(iterable)}" in ${vmBeingRendered}.`
        );
    }

    let next = iterator.next();
    let j = 0;
    let { value, done: last } = next;
    let keyMap: Record<string, number>;
    let iterationError: string | undefined;
    if (process.env.NODE_ENV !== 'production') {
        keyMap = ObjectCreate(null);
    }

    while (last === false) {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done;

        // template factory logic based on the previous collected value
        const vnode = factory(value, j, j === 0, last === true);
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        } else {
            // `isArray` doesn't narrow this block properly...
            ArrayPush.call(list, vnode as VNode | null);
        }

        if (process.env.NODE_ENV !== 'production') {
            const vnodes = isArray(vnode) ? vnode : [vnode];
            forEach.call(vnodes, (childVnode: VNode | null) => {
                // Check that the child vnode is either an element or VStatic
                if (!isNull(childVnode) && (isVBaseElement(childVnode) || isVStatic(childVnode))) {
                    const { key } = childVnode;
                    // In @lwc/engine-server the fragment doesn't have a tagName, default to the VM's tagName.
                    const { tagName } = vmBeingRendered;
                    if (isString(key) || isNumber(key)) {
                        if (keyMap[key] === 1 && isUndefined(iterationError)) {
                            iterationError = `Duplicated "key" attribute value in "<${tagName}>" for item number ${j}. A key with value "${key}" appears more than once in the iteration. Key values must be unique numbers or strings.`;
                        }
                        keyMap[key] = 1;
                    } else if (isUndefined(iterationError)) {
                        iterationError = `Invalid "key" attribute value in "<${tagName}>" for item number ${j}. Set a unique "key" value on all iterated child elements.`;
                    }
                }
            });
        }

        // preparing next value
        j += 1;
        value = next.value;
    }
    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(iterationError)) {
            logError(iterationError, vmBeingRendered!);
        }
    }
    return list;
}

/**
 * [f]lattening
 * @param items
 */
function f(items: ReadonlyArray<VNodes> | VNodes): VNodes {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    }
    const len = items.length;
    const flattened: MutableVNodes = [];
    // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic
    sc(flattened);
    for (let j = 0; j < len; j += 1) {
        const item = items[j];
        if (isArray(item)) {
            ArrayPush.apply(flattened, item);
        } else {
            // `isArray` doesn't narrow this block properly...
            ArrayPush.call(flattened, item as VNode | null);
        }
    }
    return flattened;
}

// [t]ext node
function t(text: string): VText {
    let key, elm;
    return {
        type: VNodeType.Text,
        sel: '__text__',
        text,
        elm,
        key,
        owner: getVMBeingRendered()!,
    };
}

// [co]mment node
function co(text: string): VComment {
    let elm, key;
    return {
        type: VNodeType.Comment,
        sel: '__comment__',
        text,
        elm,
        key,
        owner: getVMBeingRendered()!,
    };
}

// [d]ynamic text
function d(value: any): string {
    return value == null ? '' : String(value);
}

// [b]ind function
function b(fn: EventListener): EventListener {
    const vmBeingRendered = getVMBeingRendered();
    if (isNull(vmBeingRendered)) {
        throw new Error();
    }
    const vm: VM = vmBeingRendered;
    return function (event: Event) {
        invokeEventListener(vm, fn, vm.component, event);
    };
}

// [k]ey function
function k(compilerKey: number, obj: any): string | void {
    switch (typeof obj) {
        case 'number':
        case 'string':
            return compilerKey + ':' + obj;
        case 'object':
            if (process.env.NODE_ENV !== 'production') {
                logError(
                    `Invalid key value "${obj}" in ${getVMBeingRendered()}. Key must be a string or number.`
                );
            }
    }
}

// [g]lobal [id] function
function gid(id: string | undefined | null): string | null | undefined {
    const vmBeingRendered = getVMBeingRendered()!;
    if (isUndefined(id) || id === '') {
        return id;
    }
    // We remove attributes when they are assigned a value of null
    if (isNull(id)) {
        return null;
    }
    const { idx, shadowMode } = vmBeingRendered;
    if (shadowMode === ShadowMode.Synthetic) {
        return StringReplace.call(id, /\S+/g, (id) => `${id}-${idx}`);
    }
    return id;
}

// [f]ragment [id] function
function fid(url: string | undefined | null): string | null | undefined {
    const vmBeingRendered = getVMBeingRendered()!;
    if (isUndefined(url) || url === '') {
        return url;
    }
    // We remove attributes when they are assigned a value of null
    if (isNull(url)) {
        return null;
    }
    const { idx, shadowMode } = vmBeingRendered;
    // Apply transformation only for fragment-only-urls, and only in shadow DOM
    if (shadowMode === ShadowMode.Synthetic && /^#/.test(url)) {
        return `${url}-${idx}`;
    }
    return url;
}

/**
 * [ddc] - create a (deprecated) dynamic component via `<x-foo lwc:dynamic={Ctor}>`
 *
 * TODO [#3331]: remove usage of lwc:dynamic in 246
 * @param sel
 * @param Ctor
 * @param data
 * @param children
 */
function ddc(
    sel: string,
    Ctor: LightningElementConstructor | null | undefined,
    data: VElementData,
    children: VNodes = EmptyArray
): VCustomElement | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `dc() 1st argument sel must be a string.`);
        assert.isTrue(isObject(data), `dc() 3nd argument data must be an object.`);
        assert.isTrue(
            arguments.length === 3 || isArray(children),
            `dc() 4nd argument data must be an array.`
        );
    }
    // null or undefined values should produce a null value in the VNodes
    if (isNull(Ctor) || isUndefined(Ctor)) {
        return null;
    }
    if (!isComponentConstructor(Ctor)) {
        throw new Error(`Invalid LWC Constructor ${toString(Ctor)} for custom element <${sel}>.`);
    }

    return c(sel, Ctor, data, children);
}

/**
 * [dc] - create a dynamic component via `<lwc:component lwc:is={Ctor}>`
 * @param Ctor
 * @param data
 * @param children
 */
function dc(
    Ctor: LightningElementConstructor | null | undefined,
    data: VElementData,
    children: VNodes = EmptyArray
): VCustomElement | null {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(data), `dc() 2nd argument data must be an object.`);
        assert.isTrue(
            arguments.length === 3 || isArray(children),
            `dc() 3rd argument data must be an array.`
        );
    }
    // Null or undefined values should produce a null value in the VNodes.
    // This is the only value at compile time as the constructor will not be known.
    if (isNull(Ctor) || isUndefined(Ctor)) {
        return null;
    }

    if (!isComponentConstructor(Ctor)) {
        throw new Error(
            `Invalid constructor: "${toString(Ctor)}" is not a LightningElement constructor.`
        );
    }

    // Look up the dynamic component's name at runtime once the constructor is available.
    // This information is only known at runtime and is stored as part of registerComponent.
    const sel = getComponentRegisteredName(Ctor);
    if (isUndefined(sel) || sel === '') {
        throw new Error(
            `Invalid LWC constructor ${toString(Ctor)} does not have a registered name`
        );
    }

    return c(sel, Ctor, data, children);
}

/**
 * slow children collection marking mechanism. this API allows the compiler to signal
 * to the engine that a particular collection of children must be diffed using the slow
 * algo based on keys due to the nature of the list. E.g.:
 *
 * - slot element's children: the content of the slot has to be dynamic when in synthetic
 * shadow mode because the `vnode.children` might be the slotted
 * content vs default content, in which case the size and the
 * keys are not matching.
 * - children that contain dynamic components
 * - children that are produced by iteration
 * @param vnodes
 */
function sc(vnodes: VNodes): VNodes {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isArray(vnodes), 'sc() api can only work with arrays.');
    }
    // We have to mark the vnodes collection as dynamic so we can later on
    // choose to use the snabbdom virtual dom diffing algo instead of our
    // static dummy algo.
    markAsDynamicChildren(vnodes);
    return vnodes;
}

// [s]anitize [h]tml [c]ontent
function shc(content: unknown): SanitizedHtmlContent {
    const sanitizedString = sanitizeHtmlContent(content);
    return createSanitizedHtmlContent(sanitizedString);
}

const ncls = normalizeClass;

const api = ObjectFreeze({
    s,
    h,
    c,
    i,
    f,
    t,
    d,
    b,
    k,
    co,
    dc,
    fr,
    ti,
    st,
    gid,
    fid,
    shc,
    ssf,
    ddc,
    sp,
    ncls,
});

export default api;

export type RenderAPI = typeof api;
