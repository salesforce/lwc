import assert from "./assert.js";
import { lifeCycleHooks as hook } from "./hook.js";
import h from "snabbdom/h";

// [c]ustom element node
export function c(sel: string, Ctor: ObjectConstructor, data: Object = {}, bcDefaultSlot: Array<vnode>): Object {
    assert.isFalse("attrs" in data, `Compiler Issue: Custom elements should not have property "attrs" in data.`);
    const { key, props: _props, on, dataset, class: _class } = data;
    // assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
    // TODO: once the parser is updated, uncomment the previous line and remove this fork in favor of just data.slotset
    const slotset = data.slotset || (bcDefaultSlot && bcDefaultSlot.length && { $default$: bcDefaultSlot });
    const vnode = h(sel, { hook, key, slotset, dataset, on, props: {}, _props, _class }, []);
    vnode.Ctor = Ctor;
    return vnode;
}

// [h]tml node
export { h };

// [i]terable node
export function i(items: array<any>, factory: Function): Array<VNode> {
    const len = Array.isArray(items) ? items.length : 0;
    const list = new Array(len);
    for (let i = 0; i < len; i += 1) {
        const vnode = factory(items[i]);
        assert.vnode(vnode, 'Invariant Violation: Iteration should always produce a vnode.');
        list[i] = vnode;
    }
    return list;
}

/**
 * [s]tringify
 * This is used to guarantee that we never send null, object or undefined as a text children to snabbdom
 * - null and undefined should produce empty entry
 * - string values are on the fast lane
 * - any other object will be intentionally casted as strings
 */
export function s(value: any = ''): string  {
    return typeof value === 'string' ? value : (value === null ? '' : '' + value);
}

/**
 * [e]mpty
 * This is used to guarantee that we never send null, object or undefined as a text children to snabbdom
 * - null and undefined should produce empty entry
 * - string values are on the fast lane
 * - any other object will be intentionally casted as strings
 */
export function e(): string  {
    return '';
}

/**
 * [f]lattening
 */
export function f(items: Array<any>): Array<any>  {
    assert.isTrue(Array.isArray(items), 'flattening api can only work with arrays.')
    const len = items.length;
    const flattened = [];
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        if (Array.isArray(item)) {
            flattened.push.apply(flattened, item);
        } else {
            flattened.push(item);
        }
    }
    assert.block(() => {
        flattened.forEach((vnodeOrString: string | vnode) => {
            if (typeof vnodeOrString === 'string') {
                return;
            }
            assert.vnode(vnodeOrString, 'Invalid children element, it should be a string or a vnode.');
        });
    });
    return flattened;
}
