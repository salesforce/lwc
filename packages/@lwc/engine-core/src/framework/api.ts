/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayPush,
    assert,
    create as ObjectCreate,
    freeze as ObjectFreeze,
    forEach,
    isArray,
    isFalse,
    isFunction,
    isNull,
    isNumber,
    isObject,
    isString,
    isTrue,
    isUndefined,
    KEY__SHADOW_RESOLVER,
    StringReplace,
    toString,
} from '@lwc/shared';
import { createText, createComment, createElement, isSyntheticShadowDefined } from '../renderer';
import { logError, logWarn } from '../shared/logger';
import { invokeEventListener } from './invoker';
import { getVMBeingRendered } from './template';
import { EmptyArray, EmptyObject } from './utils';
import {
    appendVM,
    getAssociatedVMIfPresent,
    getAssociatedVM,
    removeVM,
    rerenderVM,
    runConnectedCallback,
    ShadowMode,
    SlotSet,
    VM,
    VMState,
    getRenderRoot,
    createVM,
    hydrateVM,
    RenderMode,
} from './vm';
import {
    VNode,
    VNodes,
    VElement,
    VText,
    Hooks,
    VCustomElement,
    VComment,
    VElementData,
} from '../3rdparty/snabbdom/types';
import { LightningElementConstructor } from './base-lightning-element';
import {
    createViewModelHook,
    fallbackElmHook,
    removeElmHook,
    createChildrenHook,
    updateNodeHook,
    insertNodeHook,
    removeNodeHook,
    createElmHook,
    updateElmHook,
    createCustomElmHook,
    updateCustomElmHook,
    updateChildrenHook,
    allocateChildrenHook,
    markAsDynamicChildren,
    hydrateChildrenHook,
    hydrateElmHook,
    LWCDOMMode,
} from './hooks';
import { getComponentInternalDef, isComponentConstructor } from './def';
import { getUpgradableConstructor } from './upgradable-element';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const SymbolIterator: typeof Symbol.iterator = Symbol.iterator;

const TextHook: Hooks<VText> = {
    create: (vnode) => {
        const { owner } = vnode;

        const elm = createText(vnode.text!);
        linkNodeToShadow(elm, owner);
        vnode.elm = elm;
    },
    update: updateNodeHook,
    insert: insertNodeHook,
    move: insertNodeHook, // same as insert for text nodes
    remove: removeNodeHook,
    hydrate: (vNode: VNode, node: Node) => {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line lwc-internal/no-global-node
            if (node.nodeType !== Node.TEXT_NODE) {
                logError('Hydration mismatch: incorrect node type received', vNode.owner);
                assert.fail('Hydration mismatch: incorrect node type received.');
            }

            if (node.nodeValue !== vNode.text) {
                logWarn(
                    'Hydration mismatch: text values do not match, will recover from the difference',
                    vNode.owner
                );
            }
        }

        // always set the text value to the one from the vnode.
        node.nodeValue = vNode.text ?? null;
        vNode.elm = node;
    },
};

const CommentHook: Hooks<VComment> = {
    create: (vnode) => {
        const { owner, text } = vnode;

        const elm = createComment(text);
        linkNodeToShadow(elm, owner);
        vnode.elm = elm;
    },
    update: updateNodeHook,
    insert: insertNodeHook,
    move: insertNodeHook, // same as insert for text nodes
    remove: removeNodeHook,
    hydrate: (vNode: VNode, node: Node) => {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line lwc-internal/no-global-node
            if (node.nodeType !== Node.COMMENT_NODE) {
                logError('Hydration mismatch: incorrect node type received', vNode.owner);
                assert.fail('Hydration mismatch: incorrect node type received.');
            }

            if (node.nodeValue !== vNode.text) {
                logWarn(
                    'Hydration mismatch: comment values do not match, will recover from the difference',
                    vNode.owner
                );
            }
        }

        // always set the text value to the one from the vnode.
        node.nodeValue = vNode.text ?? null;
        vNode.elm = node;
    },
};

// insert is called after update, which is used somewhere else (via a module)
// to mark the vm as inserted, that means we cannot use update as the main channel
// to rehydrate when dirty, because sometimes the element is not inserted just yet,
// which breaks some invariants. For that reason, we have the following for any
// Custom Element that is inserted via a template.
const ElementHook: Hooks<VElement> = {
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

        createElmHook(vnode);
    },
    update: (oldVnode, vnode) => {
        updateElmHook(oldVnode, vnode);
        updateChildrenHook(oldVnode, vnode);
    },
    insert: (vnode, parentNode, referenceNode) => {
        insertNodeHook(vnode, parentNode, referenceNode);
        createChildrenHook(vnode);
    },
    move: (vnode, parentNode, referenceNode) => {
        insertNodeHook(vnode, parentNode, referenceNode);
    },
    remove: (vnode, parentNode) => {
        removeNodeHook(vnode, parentNode);
        removeElmHook(vnode);
    },
    hydrate: (vnode, node) => {
        const elm = node as Element;
        vnode.elm = elm;

        const { context } = vnode.data;
        const isDomManual = Boolean(
            !isUndefined(context) &&
                !isUndefined(context.lwc) &&
                context.lwc.dom === LWCDOMMode.manual
        );

        if (isDomManual) {
            // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
            // remove the innerHTML from props so it reuses the existing dom elements.
            const { props } = vnode.data;
            if (!isUndefined(props) && !isUndefined(props.innerHTML)) {
                if (elm.innerHTML === props.innerHTML) {
                    delete props.innerHTML;
                } else {
                    logWarn(
                        `Mismatch hydrating element <${elm.tagName.toLowerCase()}>: innerHTML values do not match for element, will recover from the difference`,
                        vnode.owner
                    );
                }
            }
        }

        hydrateElmHook(vnode);

        if (!isDomManual) {
            hydrateChildrenHook(vnode.elm.childNodes, vnode.children, vnode.owner);
        }
    },
};

const CustomElementHook: Hooks<VCustomElement> = {
    create: (vnode) => {
        const { sel, owner } = vnode;
        const UpgradableConstructor = getUpgradableConstructor(sel);
        /**
         * Note: if the upgradable constructor does not expect, or throw when we new it
         * with a callback as the first argument, we could implement a more advanced
         * mechanism that only passes that argument if the constructor is known to be
         * an upgradable custom element.
         */
        const elm = new UpgradableConstructor((elm: HTMLElement) => {
            // the custom element from the registry is expecting an upgrade callback
            createViewModelHook(elm, vnode);
        });

        linkNodeToShadow(elm, owner);
        vnode.elm = elm;

        const vm = getAssociatedVMIfPresent(elm);
        if (vm) {
            allocateChildrenHook(vnode, vm);
        } else if (vnode.ctor !== UpgradableConstructor) {
            throw new TypeError(`Incorrect Component Constructor`);
        }
        createCustomElmHook(vnode);
    },
    update: (oldVnode, vnode) => {
        updateCustomElmHook(oldVnode, vnode);
        const vm = getAssociatedVMIfPresent(vnode.elm);
        if (vm) {
            // in fallback mode, the allocation will always set children to
            // empty and delegate the real allocation to the slot elements
            allocateChildrenHook(vnode, vm);
        }
        // in fallback mode, the children will be always empty, so, nothing
        // will happen, but in native, it does allocate the light dom
        updateChildrenHook(oldVnode, vnode);
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
        insertNodeHook(vnode, parentNode, referenceNode);
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
    move: (vnode, parentNode, referenceNode) => {
        insertNodeHook(vnode, parentNode, referenceNode);
    },
    remove: (vnode, parentNode) => {
        removeNodeHook(vnode, parentNode);
        const vm = getAssociatedVMIfPresent(vnode.elm);
        if (vm) {
            // for custom elements we don't have to go recursively because the removeVM routine
            // will take care of disconnecting any child VM attached to its shadow as well.
            removeVM(vm);
        }
    },
    hydrate: (vnode, elm) => {
        // the element is created, but the vm is not
        const { sel, mode, ctor, owner } = vnode;

        const def = getComponentInternalDef(ctor);
        createVM(elm, def, {
            mode,
            owner,
            tagName: sel,
        });

        vnode.elm = elm as Element;

        const vm = getAssociatedVM(elm);
        allocateChildrenHook(vnode, vm);

        hydrateElmHook(vnode);

        // Insert hook section:
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
        }
        runConnectedCallback(vm);

        if (vm.renderMode !== RenderMode.Light) {
            // VM is not rendering in Light DOM, we can proceed and hydrate the slotted content.
            // Note: for Light DOM, this is handled while hydrating the VM
            hydrateChildrenHook(vnode.elm.childNodes, vnode.children, vm);
        }

        hydrateVM(vm);
    },
};

function linkNodeToShadow(elm: Node, owner: VM) {
    const { renderMode, shadowMode } = owner;

    // TODO [#1164]: this should eventually be done by the polyfill directly
    if (isSyntheticShadowDefined) {
        if (shadowMode === ShadowMode.Synthetic || renderMode === RenderMode.Light) {
            (elm as any)[KEY__SHADOW_RESOLVER] = getRenderRoot(owner)[KEY__SHADOW_RESOLVER];
        }
    }
}

function addVNodeToChildLWC(vnode: VCustomElement) {
    ArrayPush.call(getVMBeingRendered()!.velements, vnode);
}

// [h]tml node
function h(sel: string, data: VElementData, children: VNodes): VElement {
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
        if (data.style && !isString(data.style)) {
            logError(
                `Invalid 'style' attribute passed to <${sel}> is ignored. This attribute must be a string value.`,
                vmBeingRendered
            );
        }
        forEach.call(children, (childVnode: VNode | null | undefined) => {
            if (childVnode != null) {
                assert.isTrue(
                    childVnode &&
                        'sel' in childVnode &&
                        'data' in childVnode &&
                        'children' in childVnode &&
                        'text' in childVnode &&
                        'elm' in childVnode &&
                        'key' in childVnode,
                    `${childVnode} is not a vnode.`
                );
            }
        });
    }

    let text, elm;
    const { key } = data;

    return {
        sel,
        data,
        children,
        text,
        elm,
        key,
        hook: ElementHook,
        owner: vmBeingRendered,
    };
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
): VElement | VNodes {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(slotName), `s() 1st argument slotName must be a string.`);
        assert.isTrue(isObject(data), `s() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
    }
    if (
        !isUndefined(slotset) &&
        !isUndefined(slotset[slotName]) &&
        slotset[slotName].length !== 0
    ) {
        children = slotset[slotName];
    }
    const vmBeingRendered = getVMBeingRendered()!;
    const { renderMode, shadowMode } = vmBeingRendered;

    if (renderMode === RenderMode.Light) {
        sc(children);
        return children;
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
                        childVnode &&
                            'sel' in childVnode &&
                            'data' in childVnode &&
                            'children' in childVnode &&
                            'text' in childVnode &&
                            'elm' in childVnode &&
                            'key' in childVnode,
                        `${childVnode} is not a vnode.`
                    );
                }
            });
        }
    }
    const { key } = data;
    let text, elm;
    const vnode: VCustomElement = {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: CustomElementHook,
        ctor: Ctor,
        owner: vmBeingRendered,
        mode: 'open', // TODO [#1294]: this should be defined in Ctor
    };
    addVNodeToChildLWC(vnode);
    return vnode;
}

// [i]terable node
function i(
    iterable: Iterable<any>,
    factory: (value: any, index: number, first: boolean, last: boolean) => VNodes | VNode
): VNodes {
    const list: VNodes = [];
    // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic
    sc(list);
    const vmBeingRendered = getVMBeingRendered();
    if (isUndefined(iterable) || iterable === null) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Invalid template iteration for value "${toString(
                    iterable
                )}" in ${vmBeingRendered}. It must be an Array or an iterable Object.`,
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
            )}\` in ${vmBeingRendered}. It must be an array-like object and not \`null\` nor \`undefined\`.`
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
            ArrayPush.call(list, vnode);
        }

        if (process.env.NODE_ENV !== 'production') {
            const vnodes = isArray(vnode) ? vnode : [vnode];
            forEach.call(vnodes, (childVnode: VNode | null) => {
                if (!isNull(childVnode) && isObject(childVnode) && !isUndefined(childVnode.sel)) {
                    const { key } = childVnode;
                    if (isString(key) || isNumber(key)) {
                        if (keyMap[key] === 1 && isUndefined(iterationError)) {
                            iterationError = `Duplicated "key" attribute value for "<${childVnode.sel}>" in ${vmBeingRendered} for item number ${j}. A key with value "${childVnode.key}" appears more than once in the iteration. Key values must be unique numbers or strings.`;
                        }
                        keyMap[key] = 1;
                    } else if (isUndefined(iterationError)) {
                        iterationError = `Invalid "key" attribute value in "<${childVnode.sel}>" in ${vmBeingRendered} for item number ${j}. Set a unique "key" value on all iterated child elements.`;
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
 */
function f(items: any[]): any[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    }
    const len = items.length;
    const flattened: VNodes = [];
    // TODO [#1276]: compiler should give us some sort of indicator when a vnodes collection is dynamic
    sc(flattened);
    for (let j = 0; j < len; j += 1) {
        const item = items[j];
        if (isArray(item)) {
            ArrayPush.apply(flattened, item);
        } else {
            ArrayPush.call(flattened, item);
        }
    }
    return flattened;
}

// [t]ext node
function t(text: string): VText {
    const data = EmptyObject;
    let sel, children, key, elm;
    return {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: TextHook,
        owner: getVMBeingRendered()!,
    };
}

// [co]mment node
function co(text: string): VComment {
    const data = EmptyObject;
    let sel, children, key, elm;
    return {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: CommentHook,
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
                assert.fail(
                    `Invalid key value "${obj}" in ${getVMBeingRendered()}. Key must be a string or number.`
                );
            }
    }
}

// [g]lobal [id] function
function gid(id: string | undefined | null): string | null | undefined {
    const vmBeingRendered = getVMBeingRendered()!;
    if (isUndefined(id) || id === '') {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Invalid id value "${id}". The id attribute must contain a non-empty string.`,
                vmBeingRendered
            );
        }
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
        if (process.env.NODE_ENV !== 'production') {
            if (isUndefined(url)) {
                logError(
                    `Undefined url value for "href" or "xlink:href" attribute. Expected a non-empty string.`,
                    vmBeingRendered
                );
            }
        }
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
 * Map to store an index value assigned to any dynamic component reference ingested
 * by dc() api. This allows us to generate a unique unique per template per dynamic
 * component reference to avoid diffing algo mismatches.
 */
const DynamicImportedComponentMap: Map<LightningElementConstructor, number> = new Map();
let dynamicImportedComponentCounter = 0;

/**
 * create a dynamic component via `<x-foo lwc:dynamic={Ctor}>`
 */
function dc(
    sel: string,
    Ctor: LightningElementConstructor | null | undefined,
    data: VElementData,
    children?: VNodes
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
    if (Ctor == null) {
        return null;
    }
    if (!isComponentConstructor(Ctor)) {
        throw new Error(`Invalid LWC Constructor ${toString(Ctor)} for custom element <${sel}>.`);
    }
    let idx = DynamicImportedComponentMap.get(Ctor);
    if (isUndefined(idx)) {
        idx = dynamicImportedComponentCounter++;
        DynamicImportedComponentMap.set(Ctor, idx);
    }
    // the new vnode key is a mix of idx and compiler key, this is required by the diffing algo
    // to identify different constructors as vnodes with different keys to avoid reusing the
    // element used for previous constructors.
    data.key = `dc:${idx}:${data.key}`;
    return c(sel, Ctor, data, children);
}

/**
 * slow children collection marking mechanism. this API allows the compiler to signal
 * to the engine that a particular collection of children must be diffed using the slow
 * algo based on keys due to the nature of the list. E.g.:
 *
 *   - slot element's children: the content of the slot has to be dynamic when in synthetic
 *                              shadow mode because the `vnode.children` might be the slotted
 *                              content vs default content, in which case the size and the
 *                              keys are not matching.
 *   - children that contain dynamic components
 *   - children that are produced by iteration
 *
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

/**
 * EXPERIMENTAL: This function acts like a hook for Lightning Locker Service and other similar
 * libraries to sanitize HTML content. This hook process the content passed via the template to
 * lwc:inner-html directive.
 * It is meant to be overridden with setSanitizeHtmlContentHook, it throws an error by default.
 */
let sanitizeHtmlContentHook: SanitizeHtmlContentHook = (): string => {
    // locker-service patches this function during runtime to sanitize HTML content.
    throw new Error('sanitizeHtmlContent hook must be implemented.');
};

export type SanitizeHtmlContentHook = (content: unknown) => string;

/**
 * Sets the sanitizeHtmlContentHook.
 */
export function setSanitizeHtmlContentHook(newHookImpl: SanitizeHtmlContentHook) {
    sanitizeHtmlContentHook = newHookImpl;
}

// [s]anitize [h]tml [c]ontent
function shc(content: unknown): string {
    return sanitizeHtmlContentHook(content);
}

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
    ti,
    gid,
    fid,
    shc,
});

export default api;

export type RenderAPI = typeof api;
