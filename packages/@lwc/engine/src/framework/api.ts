/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../shared/assert';
import { vmBeingRendered, invokeEventListener, invokeComponentCallback } from './invoker';
import {
    isArray,
    isUndefined,
    isNull,
    isFunction,
    isObject,
    isString,
    ArrayPush,
    create as ObjectCreate,
    forEach,
    StringCharCodeAt,
    isNumber,
    isTrue,
    isFalse,
    toString,
    ArraySlice,
} from '../shared/language';
import {
    EmptyArray,
    resolveCircularModuleDependency,
    isCircularModuleDependency,
    EmptyObject,
    useSyntheticShadow,
} from './utils';
import { VM, SlotSet } from './vm';
import { ComponentConstructor } from './component';
import {
    VNode,
    VNodeData,
    VNodes,
    VElement,
    VComment,
    VText,
    Hooks,
    Key,
    VCustomElement,
} from '../3rdparty/snabbdom/types';
import {
    createViewModelHook,
    insertCustomElmHook,
    fallbackElmHook,
    rerenderCustomElmHook,
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
    removeCustomElmHook,
} from './hooks';
import { markAsDynamicChildren } from './patch';
import { Services, invokeServiceHook } from './services';
import { markNodeFromVNode } from './restrictions';

export interface ElementCompilerData extends VNodeData {
    key: Key;
}

export interface CustomElementCompilerData extends ElementCompilerData {
    ns: undefined; // for SVGs
}

export interface RenderAPI {
    s(slotName: string, data: ElementCompilerData, children: VNodes, slotset: SlotSet): VNode;
    h(tagName: string, data: ElementCompilerData, children: VNodes): VNode;
    c(
        tagName: string,
        Ctor: ComponentConstructor,
        data: CustomElementCompilerData,
        children?: VNodes
    ): VNode;
    i(items: any[], factory: () => VNode | VNode): VNodes;
    f(items: any[]): any[];
    t(text: string): VText;
    p(text: string): VComment;
    d(value: any): VNode | null;
    b(fn: EventListener): EventListener;
    fb(fn: (...args: any[]) => any): (...args: any[]) => any;
    ll(originalHandler: EventListener, id: string, provider?: () => any): EventListener;
    k(compilerKey: number, iteratorValue: any): string | void;
}

const CHAR_S = 115;
const CHAR_V = 118;
const CHAR_G = 103;
const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
const SymbolIterator = Symbol.iterator;

const TextHook: Hooks = {
    create: (vnode: VNode) => {
        if (isUndefined(vnode.elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler
            vnode.elm = document.createTextNode(vnode.text as string);
        }
        linkNodeToShadow(vnode);
        if (process.env.NODE_ENV !== 'production') {
            markNodeFromVNode(vnode.elm as Node);
        }
    },
    update: updateNodeHook,
    insert: insertNodeHook,
    move: insertNodeHook, // same as insert for text nodes
    remove: removeNodeHook,
};

const CommentHook: Hooks = {
    create: (vnode: VComment) => {
        if (isUndefined(vnode.elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler
            vnode.elm = document.createComment(vnode.text);
        }
        linkNodeToShadow(vnode);
        if (process.env.NODE_ENV !== 'production') {
            markNodeFromVNode(vnode.elm as Node);
        }
    },
    update: updateNodeHook,
    insert: insertNodeHook,
    move: insertNodeHook, // same as insert for comment nodes
    remove: removeNodeHook,
};

// insert is called after update, which is used somewhere else (via a module)
// to mark the vm as inserted, that means we cannot use update as the main channel
// to rehydrate when dirty, because sometimes the element is not inserted just yet,
// which breaks some invariants. For that reason, we have the following for any
// Custom Element that is inserted via a template.
const ElementHook: Hooks = {
    create: (vnode: VElement) => {
        const { data, sel, elm } = vnode;
        const { ns } = data;
        if (isUndefined(elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler and style tags
            vnode.elm = isUndefined(ns)
                ? document.createElement(sel)
                : document.createElementNS(ns, sel);
        }
        linkNodeToShadow(vnode);
        if (process.env.NODE_ENV !== 'production') {
            markNodeFromVNode(vnode.elm as Element);
        }
        fallbackElmHook(vnode);
        createElmHook(vnode);
    },
    update: (oldVnode: VElement, vnode: VElement) => {
        updateElmHook(oldVnode, vnode);
        updateChildrenHook(oldVnode, vnode);
    },
    insert: (vnode: VElement, parentNode: Node, referenceNode: Node | null) => {
        insertNodeHook(vnode, parentNode, referenceNode);
        createChildrenHook(vnode);
    },
    move: (vnode: VElement, parentNode: Node, referenceNode: Node | null) => {
        insertNodeHook(vnode, parentNode, referenceNode);
    },
    remove: (vnode: VElement, parentNode: Node) => {
        removeNodeHook(vnode, parentNode);
        removeElmHook(vnode);
    },
};

const CustomElementHook: Hooks = {
    create: (vnode: VCustomElement) => {
        const { sel, elm } = vnode;
        if (isUndefined(elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler and style tags
            vnode.elm = document.createElement(sel);
        }
        linkNodeToShadow(vnode);
        if (process.env.NODE_ENV !== 'production') {
            markNodeFromVNode(vnode.elm as Element);
        }
        createViewModelHook(vnode);
        allocateChildrenHook(vnode);
        createCustomElmHook(vnode);
    },
    update: (oldVnode: VCustomElement, vnode: VCustomElement) => {
        updateCustomElmHook(oldVnode, vnode);
        // in fallback mode, the allocation will always the children to
        // empty and delegate the real allocation to the slot elements
        allocateChildrenHook(vnode);
        // in fallback mode, the children will be always empty, so, nothing
        // will happen, but in native, it does allocate the light dom
        updateChildrenHook(oldVnode, vnode);
        // this will update the shadowRoot
        rerenderCustomElmHook(vnode);
    },
    insert: (vnode: VCustomElement, parentNode: Node, referenceNode: Node | null) => {
        insertNodeHook(vnode, parentNode, referenceNode);
        createChildrenHook(vnode);
        insertCustomElmHook(vnode);
    },
    move: (vnode: VCustomElement, parentNode: Node, referenceNode: Node | null) => {
        insertNodeHook(vnode, parentNode, referenceNode);
    },
    remove: (vnode: VCustomElement, parentNode: Node) => {
        removeNodeHook(vnode, parentNode);
        removeCustomElmHook(vnode);
    },
};

function linkNodeToShadow(vnode: VNode) {
    // TODO: #1164 - this should eventually be done by the polyfill directly
    (vnode.elm as any).$shadowResolver$ = (vnode.owner.cmpRoot as any).$shadowResolver$;
}

// TODO: #1136 - this should be done by the compiler, adding ns to every sub-element
function addNS(vnode: VElement) {
    const { data, children, sel } = vnode;
    data.ns = NamespaceAttributeForSVG;
    // TODO: #1275 - review why `sel` equal `foreignObject` should get this `ns`
    if (isArray(children) && sel !== 'foreignObject') {
        for (let j = 0, n = children.length; j < n; ++j) {
            const childNode = children[j];
            if (childNode != null && childNode.hook === ElementHook) {
                addNS(childNode as VElement);
            }
        }
    }
}

function addVNodeToChildLWC(vnode: VCustomElement) {
    ArrayPush.call((vmBeingRendered as VM).velements, vnode);
}

// [h]tml node
export function h(sel: string, data: ElementCompilerData, children: VNodes): VElement {
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
            data.styleMap && data.style,
            `vnode.data.styleMap and vnode.data.style ambiguous declaration.`
        );
        if (data.style && !isString(data.style)) {
            assert.logError(
                `Invalid 'style' attribute passed to <${sel}> is ignored. This attribute must be a string value.`,
                vmBeingRendered!.elm
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
    const { key } = data;
    let text, elm;
    const vnode: VElement = {
        sel,
        data,
        children,
        text,
        elm,
        key,
        hook: ElementHook,
        owner: vmBeingRendered as VM,
    };
    if (
        sel.length === 3 &&
        StringCharCodeAt.call(sel, 0) === CHAR_S &&
        StringCharCodeAt.call(sel, 1) === CHAR_V &&
        StringCharCodeAt.call(sel, 2) === CHAR_G
    ) {
        addNS(vnode);
    }
    return vnode;
}

// [t]ab[i]ndex function
export function ti(value: any): number {
    // if value is greater than 0, we normalize to 0
    // If value is an invalid tabIndex value (null, undefined, string, etc), we let that value pass through
    // If value is less than -1, we don't care
    const shouldNormalize = value > 0 && !(isTrue(value) || isFalse(value));
    if (process.env.NODE_ENV !== 'production') {
        if (shouldNormalize) {
            assert.logError(
                `Invalid tabindex value \`${toString(
                    value
                )}\` in template for ${vmBeingRendered}. This attribute must be set to 0 or -1.`,
                vmBeingRendered!.elm
            );
        }
    }
    return shouldNormalize ? 0 : value;
}

// [s]lot element node
export function s(
    slotName: string,
    data: ElementCompilerData,
    children: VNodes,
    slotset: SlotSet | undefined
): VElement {
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
    const vnode = h('slot', data, children);
    if (useSyntheticShadow) {
        // the content of the slot has to be dynamic when in synthetic shadow mode because
        // the `vnode.children` might be the slotted content vs default content, in which case
        // the size and the keys are not matching.
        markAsDynamicChildren(children);
    }
    return vnode;
}

// [c]ustom element node
export function c(
    sel: string,
    Ctor: ComponentConstructor,
    data: CustomElementCompilerData,
    children?: VNodes
): VCustomElement {
    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }

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
            data.styleMap && data.style,
            `vnode.data.styleMap and vnode.data.style ambiguous declaration.`
        );
        if (data.style && !isString(data.style)) {
            assert.logError(
                `Invalid 'style' attribute passed to <${sel}> is ignored. This attribute must be a string value.`,
                vmBeingRendered!.elm
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
    children = arguments.length === 3 ? EmptyArray : (children as VNodes);
    const vnode: VCustomElement = {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: CustomElementHook,
        ctor: Ctor,
        owner: vmBeingRendered as VM,
        mode: 'open', // TODO: #1294 - this should be defined in Ctor
    };
    addVNodeToChildLWC(vnode);
    return vnode;
}

// [i]terable node
export function i(
    iterable: Iterable<any>,
    factory: (value: any, index: number, first: boolean, last: boolean) => VNodes | VNode
): VNodes {
    const list: VNodes = [];
    // marking the list as generated from iteration so we can optimize the diffing
    markAsDynamicChildren(list);
    if (isUndefined(iterable) || iterable === null) {
        if (process.env.NODE_ENV !== 'production') {
            assert.logError(
                `Invalid template iteration for value "${toString(
                    iterable
                )}" in ${vmBeingRendered}. It must be an Array or an iterable Object.`,
                vmBeingRendered!.elm
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
        const vnode = factory(value, j, j === 0, last);
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
                            iterationError = `Duplicated "key" attribute value for "<${
                                childVnode.sel
                            }>" in ${vmBeingRendered} for item number ${j}. A key with value "${
                                childVnode.key
                            }" appears more than once in the iteration. Key values must be unique numbers or strings.`;
                        }
                        keyMap[key] = 1;
                    } else if (isUndefined(iterationError)) {
                        iterationError = `Invalid "key" attribute value in "<${
                            childVnode.sel
                        }>" in ${vmBeingRendered} for item number ${j}. Set a unique "key" value on all iterated child elements.`;
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
            assert.logError(iterationError, vmBeingRendered!.elm);
        }
    }
    return list;
}

/**
 * [f]lattening
 */
export function f(items: any[]): any[] {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    }
    const len = items.length;
    const flattened: VNodes = [];

    // all flattened nodes should be marked as dynamic because
    // flattened nodes are because of a conditional or iteration.
    // We have to mark as dynamic because this could switch from an
    // iterator to "static" text at any time.

    // TODO: #1276 - compiler should give us some sort of indicator to describe whether a vnode is dynamic or not
    markAsDynamicChildren(flattened);
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
export function t(text: string): VText {
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
        owner: vmBeingRendered as VM,
    };
}

// comment node
export function p(text: string): VComment {
    const data = EmptyObject;
    const sel = '!';
    let children, key, elm;
    return {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: CommentHook,
        owner: vmBeingRendered as VM,
    };
}

// [d]ynamic value to produce a text vnode
export function d(value: any): VNode | null {
    if (value == null) {
        return null;
    }
    return t(value);
}

// [b]ind function
export function b(fn: EventListener): EventListener {
    if (isNull(vmBeingRendered)) {
        throw new Error();
    }
    const vm: VM = vmBeingRendered;
    return function(event: Event) {
        invokeEventListener(vm, fn, vm.component, event);
    };
}

// [f]unction_[b]ind
export function fb(fn: (...args: any[]) => any): () => any {
    if (isNull(vmBeingRendered)) {
        throw new Error();
    }
    const vm: VM = vmBeingRendered;
    return function() {
        return invokeComponentCallback(vm, fn, ArraySlice.call(arguments));
    };
}

// [l]ocator_[l]istener function
export function ll(
    originalHandler: EventListener,
    id: string,
    context?: (...args: any[]) => any
): EventListener {
    if (isNull(vmBeingRendered)) {
        throw new Error();
    }
    const vm: VM = vmBeingRendered;
    // bind the original handler with b() so we can call it
    // after resolving the locator
    const eventListener = b(originalHandler);
    // create a wrapping handler to resolve locator, and
    // then invoke the original handler.
    return function(event: Event) {
        // located service for the locator metadata
        const {
            context: { locator },
        } = vm;
        if (!isUndefined(locator)) {
            const { locator: locatorService } = Services;
            if (locatorService) {
                locator.resolved = {
                    target: id,
                    host: locator.id,
                    targetContext: isFunction(context) && context(),
                    hostContext: isFunction(locator.context) && locator.context(),
                };
                // a registered `locator` service will be invoked with
                // access to the context.locator.resolved, which will contain:
                // outer id, outer context, inner id, and inner context
                invokeServiceHook(vm, locatorService);
            }
        }
        // invoke original event listener via b()
        eventListener(event);
    };
}

// [k]ey function
export function k(compilerKey: number, obj: any): string | void {
    switch (typeof obj) {
        case 'number':
        case 'string':
            return compilerKey + ':' + obj;
        case 'object':
            if (process.env.NODE_ENV !== 'production') {
                assert.fail(
                    `Invalid key value "${obj}" in ${vmBeingRendered}. Key must be a string or number.`
                );
            }
    }
}

// [g]lobal [id] function
export function gid(id: string | undefined | null): string | null | undefined {
    if (isUndefined(id) || id === '') {
        if (process.env.NODE_ENV !== 'production') {
            assert.logError(
                `Invalid id value "${id}". The id attribute must contain a non-empty string.`,
                vmBeingRendered!.elm
            );
        }
        return id;
    }
    // We remove attributes when they are assigned a value of null
    if (isNull(id)) {
        return null;
    }
    return `${id}-${vmBeingRendered!.idx}`;
}

// [f]ragment [id] function
export function fid(url: string | undefined | null): string | null | undefined {
    if (isUndefined(url) || url === '') {
        if (process.env.NODE_ENV !== 'production') {
            if (isUndefined(url)) {
                assert.logError(
                    `Undefined url value for "href" or "xlink:href" attribute. Expected a non-empty string.`,
                    vmBeingRendered!.elm
                );
            }
        }
        return url;
    }
    // We remove attributes when they are assigned a value of null
    if (isNull(url)) {
        return null;
    }
    // Apply transformation only for fragment-only-urls
    if (/^#/.test(url)) {
        return `${url}-${vmBeingRendered!.idx}`;
    }
    return url;
}
