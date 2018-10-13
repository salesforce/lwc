import assert from "../shared/assert";
import { vmBeingRendered, invokeEventListener } from "./invoker";
import { isArray, isUndefined, isNull, isFunction, isObject, isString, ArrayPush, create as ObjectCreate, forEach, StringCharCodeAt, isNumber, isTrue } from "../shared/language";
import { EmptyArray, resolveCircularModuleDependency, isCircularModuleDependency, EmptyObject } from "./utils";
import { VM, SlotSet } from "./vm";
import { ComponentConstructor } from "./component";
import { VNode, VNodeData, VNodes, VElement, VComment, VText, Hooks, Key, VCustomElement } from "../3rdparty/snabbdom/types";
import {
    createCustomElmHook,
    insertCustomElmHook,
    createElmHook,
    destroyCustomElmHook,
    renderCustomElmHook,
    destroyElmHook,
    removeElmHook,
    createChildrenHook,
    updateNodeHook,
    insertNodeHook,
    removeNodeHook,
    createSlotElmHook,
    createElmDefaultHook,
    updateElmDefaultHook,
    createCustomElmDefaultHook,
    updateCustomElmDefaultHook,
    updateChildrenHook,
    allocateChildrenHook,
    createTextHook,
    createCommentHook,
} from "./hooks";
import { markAsDynamicChildren, hasDynamicChildren, patchEvent } from "./patch";
import {
    insertBefore,
    removeChild,
    isNativeShadowRootAvailable,
} from "./dom-api";

export interface ElementCompilerData extends VNodeData {
    key: Key;
}

export interface CustomElementCompilerData extends ElementCompilerData {
    ns: undefined; // for SVGs
}

export interface RenderAPI {
    s(slotName: string, data: ElementCompilerData, children: VNodes, slotset: SlotSet): VNode;
    h(tagName: string, data: ElementCompilerData, children: VNodes): VNode;
    c(tagName: string, Ctor: ComponentConstructor, data: CustomElementCompilerData, children?: VNodes): VNode;
    i(items: any[], factory: () => VNode | VNode): VNodes;
    f(items: any[]): any[];
    t(text: string): VText;
    p(text: string): VComment;
    d(value: any): VNode | null;
    b(fn: EventListener): EventListener;
    k(compilerKey: number, iteratorValue: any): number | string;
}

const {
    createElement,
    createElementNS,
    createTextNode,
    createComment,
} = document;

const CHAR_S = 115;
const CHAR_V = 118;
const CHAR_G = 103;
const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
const SymbolIterator = Symbol.iterator;

function noop() { /* do nothing */ }

const TextHook: Hooks = {
    create: (vnode: VNode) => {
        if (isUndefined(vnode.elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler
            vnode.elm = createTextNode.call(document, vnode.text);
        }
        createTextHook(vnode);
    },
    update: updateNodeHook,
    insert: insertNodeHook,
    remove: removeNodeHook,
    destroy: noop,
};

const CommentHook: Hooks = {
    create: (vnode: VComment) => {
        if (isUndefined(vnode.elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler
            vnode.elm = createComment.call(document, vnode.text);
        }
        createCommentHook(vnode);
    },
    update: updateNodeHook,
    insert: insertNodeHook,
    remove: removeNodeHook,
    destroy: noop,
};

// insert is called after update, which is used somewhere else (via a module)
// to mark the vm as inserted, that means we cannot use update as the main channel
// to rehydrate when dirty, because sometimes the element is not inserted just yet,
// which breaks some invariants. For that reason, we have the following for any
// Custom Element that is inserted via a template.
const ElementHook: Hooks = {
    create: (vnode: VElement) => {
        const { data, sel, elm } = vnode;
        const { ns, create } = data;
        if (isUndefined(elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler and style tags
            vnode.elm = isUndefined(ns)
                ? createElement.call(document, sel)
                : createElementNS.call(document, ns, sel);
        }
        createElmHook(vnode);
        create(vnode);
    },
    update: (oldVnode: VElement, vnode: VElement) => {
        const { data: { update } } = vnode;
        update(oldVnode, vnode);
        updateChildrenHook(oldVnode, vnode);
    },
    insert: (vnode: VElement, parentNode: Node, referenceNode: Node | null) => {
        insertBefore.call(parentNode, vnode.elm as Element, referenceNode);
        createChildrenHook(vnode);
    },
    remove: (vnode: VElement, parentNode: Node) => {
        removeChild.call(parentNode, vnode.elm as Node);
        removeElmHook(vnode);
    },
    destroy: destroyElmHook,
};

const CustomElementHook: Hooks = {
    create: (vnode: VCustomElement) => {
        const { sel, data: { create }, elm } = vnode;
        if (isUndefined(elm)) {
            // supporting the ability to inject an element via a vnode
            // this is used mostly for caching in compiler and style tags
            vnode.elm = createElement.call(document, sel);
        }
        createElmHook(vnode);
        createCustomElmHook(vnode);
        allocateChildrenHook(vnode);
        create(vnode);
    },
    update: (oldVnode: VCustomElement, vnode: VCustomElement) => {
        const { data: { update } } = vnode;
        update(oldVnode, vnode);
        // in fallback mode, the allocation will always the children to
        // empty and delegate the real allocation to the slot elements
        allocateChildrenHook(vnode);
        // in fallback mode, the children will be always empty, so, nothing
        // will happen, but in native, it does allocate the light dom
        updateChildrenHook(oldVnode, vnode);
        // this will update the shadowRoot
        renderCustomElmHook(vnode);
    },
    insert: (vnode: VCustomElement, parentNode: Node, referenceNode: Node | null) => {
        insertBefore.call(parentNode, vnode.elm as Element, referenceNode);
        createChildrenHook(vnode);
        insertCustomElmHook(vnode);
    },
    remove: (vnode: VElement, parentNode: Node) => {
        removeChild.call(parentNode, vnode.elm as Node);
        removeElmHook(vnode);
    },
    destroy: (vnode: VCustomElement) => {
        destroyCustomElmHook(vnode);
        destroyElmHook(vnode);
    },
};

// TODO: this should be done by the compiler, adding ns to every sub-element
function addNS(vnode: VElement) {
    const { data, children, sel } = vnode;
    // TODO: review why `sel` equal `foreignObject` should get this `ns`
    data.ns = NamespaceAttributeForSVG;
    if (isArray(children) && sel !== 'foreignObject') {
        for (let j = 0, n = children.length; j < n; ++j) {
            const childNode = children[j];
            if (childNode != null && childNode.hook === ElementHook) {
                addNS(childNode as VElement);
            }
        }
    }
}

function getCurrentOwnerId(): number {
    if (process.env.NODE_ENV !== 'production') {
        // TODO: enable this after refactoring all failing tests
        if (isNull(vmBeingRendered)) {
            return 0;
        }
        // assert.invariant(!isNull(vmBeingRendered), `Invalid invocation of getCurrentOwnerId().`);
    }
    return (vmBeingRendered as VM).uid;
}

const getCurrentFallback: () => boolean = isNativeShadowRootAvailable ?
    function() {
        if (process.env.NODE_ENV !== 'production') {
            // TODO: enable this after refactoring all failing tests
            // assert.invariant(!isNull(vmBeingRendered), `Invalid invocation of getCurrentFallback().`);
        }
        return (vmBeingRendered as VM).fallback;
    } : () => {
        if (process.env.NODE_ENV !== 'production') {
            // TODO: enable this after refactoring all failing tests
            // assert.invariant(!isNull(vmBeingRendered), `Invalid invocation of getCurrentFallback().`);
        }
        return true;
    };

function getCurrentShadowAttribute(): string | undefined {
    if (process.env.NODE_ENV !== 'production') {
        // TODO: enable this after refactoring all failing tests
        if (isNull(vmBeingRendered)) {
            return;
        }
        // assert.invariant(!isNull(vmBeingRendered), `Invalid invocation of getCurrentShadowToken().`);
    }
    // TODO: remove this condition after refactoring all failing tests
    return (vmBeingRendered as VM).context.shadowAttribute;
}

// [h]tml node
export function h(sel: string, data: ElementCompilerData, children: VNodes): VElement {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `h() 1st argument sel must be a string.`);
        assert.isTrue(isObject(data), `h() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
        assert.isTrue("key" in data, ` <${sel}> "key" attribute is invalid or missing for ${vmBeingRendered}. Key inside iterator is either undefined or null.`);
        // checking reserved internal data properties
        assert.isFalse(data.className && data.classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
        assert.isFalse(data.styleMap && data.style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
        if (data.style && !isString(data.style)) {
            assert.logWarning(
                `Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`,
                vmBeingRendered!.elm
            );
        }
        forEach.call(children, (childVnode: VNode | null | undefined) => {
            if (childVnode != null) {
                assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode, `${childVnode} is not a vnode.`);
            }
        });
    }
    const { key } = data;
    if (isUndefined(data.create)) {
        data.create = createElmDefaultHook;
    }
    if (isUndefined(data.update)) {
        data.update = updateElmDefaultHook;
    }
    let text, elm; // tslint:disable-line
    const vnode: VElement = {
        sel,
        data,
        children,
        text,
        elm,
        key,
        hook: ElementHook,
        shadowAttribute: getCurrentShadowAttribute(),
        uid: getCurrentOwnerId(),
        fallback: getCurrentFallback(),
    };
    if (sel.length === 3 && StringCharCodeAt.call(sel, 0) === CHAR_S && StringCharCodeAt.call(sel, 1) === CHAR_V && StringCharCodeAt.call(sel, 2) === CHAR_G) {
        addNS(vnode);
    }
    return vnode;
}

// [s]lot element node
export function s(slotName: string, data: ElementCompilerData, children: VNodes, slotset: SlotSet | undefined): VElement {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(slotName), `s() 1st argument slotName must be a string.`);
        assert.isTrue(isObject(data), `s() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
    }
    if (!isUndefined(slotset) && !isUndefined(slotset[slotName]) && slotset[slotName].length !== 0) {
        children = slotset[slotName];
    }
    const vnode = h('slot', data, children);
    if (isTrue(vnode.fallback)) {
        markAsDynamicChildren(children);
    }
    const { data: { create: originalCreate } } = vnode;
    vnode.data.create = (newVnode: VElement) => {
        // TODO: eventually, the compiler should add this hook directly via data.create function
        createSlotElmHook(newVnode);
        originalCreate(newVnode);
    };
    return vnode;
}

// [c]ustom element node
export function c(sel: string, Ctor: ComponentConstructor, data: CustomElementCompilerData, children?: VNodes): VCustomElement {
    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
        assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
        assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
        assert.isTrue(arguments.length === 3 || isArray(children), `c() 4nd argument data must be an array.`);
        // TODO: enable this once all tests are changed to use compileTemplate utility
        // assert.isTrue("key" in compilerData, ` <${sel}> "key" attribute is invalid or missing for ${vmBeingRendered}. Key inside iterator is either undefined or null.`);
        // checking reserved internal data properties
        assert.isFalse(data.className && data.classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
        assert.isFalse(data.styleMap && data.style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
        if (data.style && !isString(data.style)) {
            assert.logWarning(
                `Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`,
                vmBeingRendered!.elm
            );
        }
        if (arguments.length === 4) {
            forEach.call(children, (childVnode: VNode | null | undefined) => {
                if (childVnode != null) {
                    assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode, `${childVnode} is not a vnode.`);
                }
            });
        }
    }
    const { key } = data;
    if (isUndefined(data.create)) {
        data.create = createCustomElmDefaultHook;
    }
    if (isUndefined(data.update)) {
        data.update = updateCustomElmDefaultHook;
    }
    let text, elm; // tslint:disable-line
    children = arguments.length === 3 ? EmptyArray : children as VNodes;
    const vnode: VCustomElement = {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: CustomElementHook,
        ctor: Ctor,
        shadowAttribute: getCurrentShadowAttribute(),
        uid: getCurrentOwnerId(),
        fallback: getCurrentFallback(),
        mode: 'open', // TODO: this should be defined in Ctor
    };
    return vnode;
}

// [i]terable node
export function i(iterable: Iterable<any>, factory: (value: any, index: number, first: boolean, last: boolean) => VNodes | VNode): VNodes {
    const list: VNodes = [];
    // marking the list as generated from iteration so we can optimize the diffing
    markAsDynamicChildren(list);
    if (isUndefined(iterable) || iterable === null) {
        if (process.env.NODE_ENV !== 'production') {
            assert.logWarning(
                `Invalid template iteration for value "${iterable}" in ${vmBeingRendered}, it should be an Array or an iterable Object.`,
                vmBeingRendered!.elm
            );
        }
        return list;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.isFalse(isUndefined(iterable[SymbolIterator]), `Invalid template iteration for value \`${iterable}\` in ${vmBeingRendered}, it requires an array-like object, not \`null\` or \`undefined\`.`);
    }
    const iterator = iterable[SymbolIterator]();

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(iterator && isFunction(iterator.next), `Invalid iterator function for "${iterable}" in ${vmBeingRendered}.`);
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
                            iterationError = `Duplicated "key" attribute value for "<${childVnode.sel}>" in ${vmBeingRendered} for item number ${j}. Key with value "${childVnode.key}" appears more than once in iteration. Key values must be unique numbers or strings.`;
                        }
                        keyMap[key] = 1;
                    } else if (isUndefined(iterationError)) {
                        iterationError = `Invalid "key" attribute value in "<${childVnode.sel}>" in ${vmBeingRendered} for item number ${j}. Instead set a unique "key" attribute value on all iteration children so internal state can be preserved during rehydration.`;
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
    for (let j = 0; j < len; j += 1) {
        const item = items[j];
        if (isArray(item)) {
            ArrayPush.apply(flattened, item);
            // iteration mark propagation so the flattened structure can
            // be diffed correctly.
            if (hasDynamicChildren(item)) {
                markAsDynamicChildren(flattened);
            }
        } else {
            ArrayPush.call(flattened, item);
        }
    }
    return flattened;
}

// [t]ext node
export function t(text: string): VText {
    const data = EmptyObject;
    let sel, children, key, elm; // tslint:disable-line
    return {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: TextHook,
        uid: getCurrentOwnerId(),
        fallback: getCurrentFallback(),
    };
}

// comment node
export function p(text: string): VComment {
    const data = EmptyObject;
    let sel = '!', children, key, elm; // tslint:disable-line
    return {
        sel,
        data,
        children,
        text,
        elm,
        key,

        hook: CommentHook,
        uid: getCurrentOwnerId(),
        fallback: getCurrentFallback(),
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
        if (vm.fallback) {
            patchEvent(event);
        }
        invokeEventListener(vm, fn, vm.component, event);
    };
}

// [k]ey function
export function k(compilerKey: number, obj: any): number | string | void {
    switch (typeof obj) {
        case 'number':
            // TODO: when obj is a numeric key, we might be able to use some
            // other strategy to combine two numbers into a new unique number
        case 'string':
            return compilerKey + ':' + obj;
        case 'object':
            if (process.env.NODE_ENV !== 'production') {
                assert.fail(`Invalid key value "${obj}" in ${vmBeingRendered}. Key must be a string or number.`);
            }
    }
}
