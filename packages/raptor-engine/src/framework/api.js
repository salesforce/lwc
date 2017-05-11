import assert from "./assert.js";
import { lifeCycleHooks as hook } from "./hook.js";
import { isArray, create, isUndefined, isFunction, isObject, isString, toString, ArrayPush } from "./language.js";
import { vmBeingRendered, invokeComponentCallback } from "./invoker.js";

const CHAR_S = 115;
const CHAR_V = 118;
const CHAR_G = 103;
const EmptyData = create(null);
const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';

// Node Types
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const ELEMENT_NODE = 1; // An Element node such as <p> or <div>.
const TEXT_NODE = 3;    // The actual Text of Element or Attr.

function nodeToVNode(elm: Node): VNode {
    // TODO: generalize this to support all kind of Nodes
    // TODO: instead of creating the vnode() directly, use toVNode() or something else from snabbdom
    // TODO: the element could be derivated from another raptor component, in which case we should
    // use the corresponding vnode instead
    assert.isTrue(elm instanceof Node, "Only Node can be wrapped by h()");
    const { nodeType } = elm;
    if (nodeType === TEXT_NODE) {
        return v(undefined, undefined, undefined, elm.textContent, elm);
    }
    if (nodeType === ELEMENT_NODE) {
        // TODO: support "is"" attribute
        return v(elm.tagName.toLowerCase(), undefined, undefined, undefined, elm);
    }
    throw new Error(`Invalid NodeType: ` + nodeType);
}

function addNS(data: any, children: Array<VNode> | undefined, sel: string | undefined) {
    data.ns = NamespaceAttributeForSVG;
    if (isUndefined(children) || sel === 'foreignObject') {
        return;
    }
    const len = children.length;
    for (let i = 0; i < len; ++i) {
        const child = children[i];
        let { data } = child;
        if (data !== undefined) {
            const grandChildren: Array<VNode> = child.children;
            addNS(data, grandChildren, child.sel);
        }
    }
}

// [v]node node
export function v(sel: string | undefined, data: VNodeData, children: Array<VNode | string> | undefined, text?: string | undefined, elm?: Element | Text | undefined, Ctor?: Class<Component>): VNode {
    data = data || EmptyData;
    let { key } = data;
    const vnode = { sel, data, children, text, elm, key, Ctor };
    assert.block(function devModeCheck() {
        // adding toString to all vnodes for debuggability
        vnode.toString = (): string => `[object:vnode ${sel}]`;
    });
    return vnode;
}

// [h]tml node
export function h(sel: string, data: VNodeData, children: Array<any>): VNode {
    assert.isTrue(isString(sel), `h() 1st argument sel must be a string.`);
    assert.isTrue(isObject(data), `h() 2nd argument data must be an object.`);
    assert.isTrue(isArray(children), `h() 3rd argument children must be an array.`);
    // checking reserved internal data properties
    assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling h().`);
    assert.invariant(data.eventNames === undefined, `vnode.data.eventNames should be undefined when calling h().`);
    if (children.length) {
        n(children);
    }
    if (sel.length === 3 && sel.charCodeAt(0) === CHAR_S && sel.charCodeAt(1) === CHAR_V && sel.charCodeAt(2) === CHAR_G) {
        addNS(data, children, sel);
    }
    return v(sel, data, children);
}

// [c]ustom element node
export function c(sel: string, Ctor: Class<Component>, data: Object): Object {
    assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
    assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
    assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
        // checking reserved internal data properties
    assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling c().`);
    assert.invariant(data.eventNames === undefined, `vnode.data.eventNames should be undefined when calling c().`);
    const { key, slotset, attrs, on, className, classMap, props: _props } = data;
    assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
    return v(sel, { hook, key, slotset, attrs, on, className, classMap, _props }, [], undefined, undefined, Ctor);
}

// [i]terable node
export function i(items: Array<any>, factory: Function): Array<VNode> {
    const len = isArray(items) ? items.length : 0;
    const list = [];
    for (let i = 0; i < len; i += 1) {
        const vnode = factory(items[i], i);
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        } else {
            ArrayPush.call(list, vnode);
        }
        assert.block(function devModeCheck() {
            const vnodes = isArray(vnode) ? vnode : [vnode];
            vnodes.forEach((vnode: VNode | any) => {
                if (vnode && typeof vnode === 'object' && vnode.sel && vnode.Ctor && isUndefined(vnode.key)) {
                    // TODO - it'd be nice to log the owner component rather than the iteration children
                    assert.logWarning(`Missing "key" attribute in iteration with child "${toString(vnode.Ctor.name)}", index ${i} of ${len}. Instead set a unique "key" attribute value on all iteration children so internal state can be preserved during rehydration.`);
                }
            });
        });
    }
    return list;
}

/**
 * [s]tringify
 */
export function s(value: any = ''): any {
    // deprecated
    return value;
}

/**
 * [e]mpty
 */
export function e(): null {
    // deprecated
    return null;
}

/**
 * [f]lattening
 */
export function f(items: Array<any>): Array<any> {
    assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    const len = items.length;
    const flattened = [];
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        if (isArray(item)) {
            ArrayPush.apply(flattened, item);
        } else {
            ArrayPush.call(flattened, item);
        }
    }
    return flattened;
}

// [n]ormalize children nodes
export function n(children: Array<VNode|null|number|string|Node>): Array<VNode> {
    const len = children.length;
    for (let i = 0; i < len; ++i) {
        const child = children[i];
        const t = typeof child;
        if (t === 'string' || t === 'number') {
            children[i] = v(undefined, undefined, undefined, child);
        } else if (child && !("Ctor" in child)) {
            if ("nodeType" in child) {
                children[i] = nodeToVNode(child);
            } else {
                children[i] = v(undefined, undefined, undefined, child);
            }
        }
    }
    return children;
}

// [b]ind function
export function b(fn: EventListener): EventListener {
    assert.vm(vmBeingRendered);
    function handler(event: Event) {
        // TODO: only if the event is `composed` it can be dispatched
        invokeComponentCallback(handler.vm, handler.fn, handler.vm.component, [event]);
    }
    handler.vm = vmBeingRendered;
    handler.fn = fn;
    return handler;
}
