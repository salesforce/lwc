import assert from "./assert";
import { lifeCycleHooks as hook } from "./hook";
import { isArray, create, isUndefined, isFunction, isObject, isString, toString, ArrayPush } from "./language";
import { vmBeingRendered, invokeComponentCallback } from "./invoker";
import { getMapFromClassName } from "./utils";

const CHAR_S = 115;
const CHAR_V = 118;
const CHAR_G = 103;
const EmptyData = create(null);
const NamespaceAttributeForSVG = 'http://www.w3.org/2000/svg';
const SymbolIterator = Symbol.iterator;

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
export function v(sel: string | undefined, data: VNodeData | undefined, children: Array<VNode | string> | undefined, text?: string | number | undefined, elm?: Element | Text | undefined, Ctor?: Class<Component>): VNode {
    data = data || EmptyData;
    let { key } = data;
    // Try to identify the owner, but for root elements and other special cases, we
    // can just fallback to 0 which means top level creation.
    const uid = vmBeingRendered ? vmBeingRendered.uid : 0;
    const vnode: VNode = { sel, data, children, text, elm, key, Ctor, uid };
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
    const { classMap, className, style, styleMap } = data;
    assert.isFalse(className && classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
    data.class = classMap || (className && getMapFromClassName(className));
    assert.isFalse(styleMap && style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
    assert.block(function devModeCheck () {
        if (style && !isString(style)) {
            assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }
    });
    data.style = styleMap || (style && style + '');
    assert.block(function devModeCheck() {
        children.forEach((vnode) => {
            if (vnode === null) {
                return;
            }
            assert.vnode(vnode);
        });
    });
    if (sel.length === 3 && sel.charCodeAt(0) === CHAR_S && sel.charCodeAt(1) === CHAR_V && sel.charCodeAt(2) === CHAR_G) {
        addNS(data, children, sel);
    }
    return v(sel, data, children);
}

// [c]ustom element node
export function c(sel: string, Ctor: Class<Component>, data: VNodeData): VNode {
    // The compiler produce AMD modules that do not support circular dependencies
    // We need to create an indirection to circumvent those cases.
    // We could potentially move this check to the definition
    if (Ctor.__circular__) {
        Ctor = Ctor();
    }

    assert.isTrue(isString(sel), `c() 1st argument sel must be a string.`);
    assert.isTrue(isFunction(Ctor), `c() 2nd argument Ctor must be a function.`);
    assert.isTrue(isObject(data), `c() 3nd argument data must be an object.`);
        // checking reserved internal data properties
    assert.invariant(data.class === undefined, `vnode.data.class should be undefined when calling c().`);
    const { key, slotset, styleMap, style, attrs, on, className, classMap, props: _props } = data;
    assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
    data = { hook, key, slotset, attrs, on, _props };
    assert.isFalse(className && classMap, `vnode.data.className and vnode.data.classMap ambiguous declaration.`);
    data.class = classMap || (className && getMapFromClassName(className));
    assert.isFalse(styleMap && style, `vnode.data.styleMap and vnode.data.style ambiguous declaration.`);
    assert.block(function devModeCheck () {
        if (style && !isString(style)) {
            assert.logWarning(`Invalid 'style' attribute passed to <${sel}> should be a string value, and will be ignored.`);
        }
    });
    data.style = styleMap || (style && style + '');
    return v(sel, data, [], undefined, undefined, Ctor);
}

// [i]terable node
export function i(iterable: Iterable<any>, factory: Function): Array<VNode> {
    const list: Array<VNode> = [];
    if (isUndefined(iterable) || iterable === null) {
        assert.logError(`Invalid template iteration for value "${iterable}" in ${vmBeingRendered}, it should be an Array or an iterable Object.`);
        return list;
    }
    assert.isFalse(isUndefined(iterable[SymbolIterator]), `Invalid template iteration for value \`${iterable}\` in ${vmBeingRendered}, it requires an array-like object, not \`null\` or \`undefined\`.`);
    const iterator = iterable[SymbolIterator]();
    assert.isTrue(iterator && isFunction(iterator.next), `Invalid iterator function for "${iterable}" in ${vmBeingRendered}.`);

    let next = iterator.next();
    let i = 0;
    let { value, done: last } = next;
    while (last === false) {
        // implementing a look-back-approach because we need to know if the element is the last
        next = iterator.next();
        last = next.done;

        // template factory logic based on the previous collected value
        const vnode = factory(value, i, i === 0, last);
        if (isArray(vnode)) {
            ArrayPush.apply(list, vnode);
        } else {
            ArrayPush.call(list, vnode);
        }
        assert.block(function devModeCheck() {
            const vnodes = isArray(vnode) ? vnode : [vnode];
            vnodes.forEach((vnode: VNode | any) => {
                if (vnode && isObject(vnode) && vnode.sel && vnode.Ctor && isUndefined(vnode.key)) {
                    // TODO - it'd be nice to log the owner component rather than the iteration children
                    assert.logWarning(`Missing "key" attribute in iteration with child "${toString(vnode.Ctor.name)}", index ${i}. Instead set a unique "key" attribute value on all iteration children so internal state can be preserved during rehydration.`);
                }
            });
        });

        // preparing next value
        i += 1;
        value = next.value;
    }
    return list;
}

/**
 * [f]lattening
 */
export function f(items: Array<any>): Array<any> {
    assert.isTrue(isArray(items), 'flattening api can only work with arrays.');
    const len = items.length;
    const flattened: Array<VNode|null|number|string> = [];
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

// [t]ext node
export function t(value: string | number): VNode {
    return v(undefined, undefined, undefined, value);
}

// [d]ynamic value to produce a text vnode
export function d(value: any): VNode | null {
    if (value === undefined || value === null) {
        return null;
    }
    return v(undefined, undefined, undefined, value);
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
