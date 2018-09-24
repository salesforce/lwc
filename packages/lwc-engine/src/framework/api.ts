import assert from "../shared/assert";
import { vmBeingRendered, invokeEventListener } from "./invoker";
import { freeze, isArray, isUndefined, isNull, isFunction, isObject, isString, ArrayPush, assign, create, forEach, StringSlice, StringCharCodeAt, isNumber, isTrue, hasOwnProperty } from "../shared/language";
import { EmptyArray, SPACE_CHAR, ViewModelReflection, resolveCircularModuleDependency, isCircularModuleDependency } from "./utils";
import { renderVM, createVM, appendVM, removeVM, VM, getCustomElementVM, SlotSet, allocateInSlot } from "./vm";
import { ComponentConstructor } from "./component";
import { VNode, VNodeData, VNodes, VElement, VComment, VText, Hooks } from "../3rdparty/snabbdom/types";
import { patchEvent } from "../faux-shadow/faux";
import { patchElementWithRestrictions } from "lwc-engine/src/framework/restrictions";

export interface RenderAPI {
    s(slotName: string, data: VNodeData, children: VNodes, slotset: SlotSet): VNode;
    h(tagName: string, data: VNodeData, children: VNodes): VNode;
    c(tagName: string, Ctor: ComponentConstructor, data: VNodeData, children?: VNodes): VNode;
    i(items: any[], factory: () => VNode | VNode): VNodes;
    f(items: any[]): any[];
    t(text: string): VText;
    p(text: string): VComment;
    d(value: any): VNode | null;
    b(fn: EventListener): EventListener;
    k(compilerKey: number, iteratorValue: any): number | string;
}

const CHAR_S = 115;
const CHAR_V = 118;
const CHAR_G = 103;
const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
const SymbolIterator = Symbol.iterator;

const { ELEMENT_NODE, TEXT_NODE, COMMENT_NODE } = Node;

const classNameToClassMap = create(null);

function getMapFromClassName(className: string | undefined): Record<string, boolean> | undefined {
    if (className === undefined) {
        return;
    }
    let map = classNameToClassMap[className];
    if (map) {
        return map;
    }
    map = {};
    let start = 0;
    let o;
    const len = className.length;
    for (o = 0; o < len; o++) {
        if (StringCharCodeAt.call(className, o) === SPACE_CHAR) {
            if (o > start) {
                map[StringSlice.call(className, start, o)] = true;
            }
            start = o + 1;
        }
    }

    if (o > start) {
        map[StringSlice.call(className, start, o)] = true;
    }
    classNameToClassMap[className] = map;
    if (process.env.NODE_ENV !== 'production') {
        // just to make sure that this object never changes as part of the diffing algo
        freeze(map);
    }
    return map;
}

// insert is called after postpatch, which is used somewhere else (via a module)
// to mark the vm as inserted, that means we cannot use postpatch as the main channel
// to rehydrate when dirty, because sometimes the element is not inserted just yet,
// which breaks some invariants. For that reason, we have the following for any
// Custom Element that is inserted via a template.
const hook: Hooks = {
    postpatch(oldVNode: VNode, vnode: VNode) {
        const vm = getCustomElementVM(vnode.elm as HTMLElement);
        renderVM(vm);
    },
    insert(vnode: VNode) {
        const vm = getCustomElementVM(vnode.elm as HTMLElement);
        appendVM(vm);
        renderVM(vm);
    },
    create(oldVNode: VNode, vnode: VNode) {
        const { fallback, mode, ctor } = vnode.data;
        const elm = vnode.elm as HTMLElement;
        if (hasOwnProperty.call(elm, ViewModelReflection)) {
            // There is a possibility that a custom element is registered under tagName,
            // in which case, the initialization is already carry on, and there is nothing else
            // to do here since this hook is called right after invoking `document.createElement`.
            return;
        }
        createVM(vnode.sel as string, elm, ctor, {
            mode,
            fallback,
        });
        const vm = getCustomElementVM(elm);
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
            assert.isTrue(isArray(vnode.children), `Invalid vnode for a custom element, it must have children defined.`);
        }
        if (isTrue(vm.fallback)) {
            // slow path
            const children = vnode.children as VNodes;
            allocateInSlot(vm, children);
            // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
            vnode.children = EmptyArray;
        }
    },
    update(oldVNode: VNode, vnode: VNode) {
        const vm = getCustomElementVM(vnode.elm as HTMLElement);
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
            assert.isTrue(isArray(vnode.children), `Invalid vnode for a custom element, it must have children defined.`);
        }
        if (isTrue(vm.fallback)) {
            // slow path
            const children = vnode.children as VNodes;
            allocateInSlot(vm, children);
            // every child vnode is now allocated, and the host should receive none directly, it receives them via the shadow!
            vnode.children = EmptyArray;
        }
    },
    destroy(vnode: VNode) {
        removeVM(getCustomElementVM(vnode.elm as HTMLElement));
    }
};

function isVElement(vnode: VNode): vnode is VElement {
    return vnode.nt === ELEMENT_NODE;
}

function addNS(vnode: VElement) {
    const { data, children, sel } = vnode;
    // TODO: review why `sel` equal `foreignObject` should get this `ns`
    data.ns = NamespaceAttributeForSVG;
    if (isArray(children) && sel !== 'foreignObject') {
        for (let j = 0, n = children.length; j < n; ++j) {
            const childNode = children[j];
            if (childNode != null && isVElement(childNode)) {
                addNS(childNode);
            }
        }
    }
}

function getCurrentOwnerId(): number {
    return isNull(vmBeingRendered) ? 0 : vmBeingRendered.uid;
}

function getCurrentFallback(): boolean {
    // TODO: eventually this should fallback to false to favor real Shadow DOM
    return isNull(vmBeingRendered) || vmBeingRendered.fallback;
}

function getCurrentShadowToken(): string | undefined {
    // For root elements and other special cases the vm is not set.
    if (isNull(vmBeingRendered)) {
        return;
    }
    return vmBeingRendered.context.shadowToken;
}

function normalizeStyleString(value: any): string | undefined {
    if (value == null || value === false) {
        return;
    }
    if (isString(value)) {
        return value;
    }
    return value + '';
}

// [h]tml node
export function h(sel: string, data: VNodeData, children: VNodes): VElement {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `h() 1st argument sel must be a string.`);
        assert.isTrue(isObject(data), `h() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
        assert.isTrue(('key' in data) || !!data.key, ` <${sel}> "key" attribute is invalid or missing for ${vmBeingRendered}. Key inside iterator is either undefined or null.`);
        // checking reserved internal data properties
        assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling h().`);
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
                assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode && "nt" in childVnode, `${childVnode} is not a vnode.`);
            }
        });
    }
    const { classMap, className, style, styleMap, key } = data;
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentShadowToken();
    data.uid = getCurrentOwnerId();
    if (process.env.NODE_ENV !== 'production') {
        // adding a hook to patch elements generated from template
        // with the corresponding set of restrictions only in dev-demo
        data.hook = {
            create(oldVNode: VNode, newVnode: VNode) {
                patchElementWithRestrictions(newVnode.elm as Element);
            }
        };
    }
    let text, elm; // tslint:disable-line
    const vnode: VElement = {
        nt: ELEMENT_NODE,
        tag: sel,
        sel,
        data,
        children,
        text,
        elm,
        key,
    };
    if (sel.length === 3 && StringCharCodeAt.call(sel, 0) === CHAR_S && StringCharCodeAt.call(sel, 1) === CHAR_V && StringCharCodeAt.call(sel, 2) === CHAR_G) {
        addNS(vnode);
    }
    return vnode;
}

// [s]lot element node
export function s(slotName: string, data: VNodeData, children: VNodes, slotset: SlotSet | undefined): VElement {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(slotName), `s() 1st argument slotName must be a string.`);
        assert.isTrue(isObject(data), `s() 2nd argument data must be an object.`);
        assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
    }
    return h('slot', data, isUndefined(slotset) || isUndefined(slotset[slotName]) || slotset[slotName].length === 0 ? children : slotset[slotName]);
}

// [c]ustom element node
export function c(sel: string, Ctor: ComponentConstructor, data: VNodeData, children?: VNodes): VElement {
    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
        assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
        assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
        assert.isTrue(arguments.length === 3 || isArray(children), `c() 4nd argument data must be an array.`);
        // checking reserved internal data properties
        assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling c().`);
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
                    assert.isTrue(childVnode && "sel" in childVnode && "data" in childVnode && "children" in childVnode && "text" in childVnode && "elm" in childVnode && "key" in childVnode && "nt" in childVnode, `${childVnode} is not a vnode.`);
                }
            });
        }
    }
    const { key, styleMap, style, on, className, classMap, props } = data;
    let { attrs } = data;

    // hack to allow component authors to force the usage of the "is" attribute in their components
    const { forceTagName } = Ctor;
    let tag = sel, text, elm; // tslint:disable-line
    if (!isUndefined(attrs) && !isUndefined(attrs.is)) {
        tag = sel;
        sel = attrs.is as string;
    } else if (!isUndefined(forceTagName)) {
        tag = forceTagName;
        attrs = assign(create(null), attrs);
        (attrs as any).is = sel;
    }

    data = { hook, key, attrs, on, props, ctor: Ctor };
    data.class = classMap || getMapFromClassName(normalizeStyleString(className));
    data.style = styleMap || normalizeStyleString(style);
    data.token = getCurrentShadowToken();
    data.uid = getCurrentOwnerId();
    data.fallback = getCurrentFallback();
    data.mode = 'open'; // TODO: this should be defined in Ctor
    children = arguments.length === 3 ? EmptyArray : children;
    const vnode: VElement = {
        nt: ELEMENT_NODE,
        tag,
        sel,
        data,
        children,
        text,
        elm,
        key,
    };
    return vnode;
}

// [i]terable node
export function i(iterable: Iterable<any>, factory: (value: any, index: number, first: boolean, last: boolean) => VNodes | VNode): VNodes {
    const list: VNodes = [];
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
        keyMap = create(null);
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
    const flattened: Array<VNode|null|number|string> = [];
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
    let sel, data = { uid: getCurrentOwnerId() }, children, key, elm; // tslint:disable-line
    return {
        nt: TEXT_NODE,
        sel,
        data,
        children,
        text,
        elm,
        key,
    };
}

export function p(text: string): VComment {
    let sel = '!', data = { uid: getCurrentOwnerId() }, children, key, elm; // tslint:disable-line
    return {
        nt: COMMENT_NODE,
        sel,
        data,
        children,
        text,
        elm,
        key,
    };
}

// [d]ynamic value to produce a text vnode
export function d(value: any): VNode | null {
    if (value === undefined || value === null) {
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
