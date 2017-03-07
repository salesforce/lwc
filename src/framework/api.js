import assert from "./assert.js";
import { lifeCycleHooks as hook } from "./hook.js";
import h from "snabbdom/h";

// [c]ustom element node
export function c(sel: string, Ctor: Class<Component>, data: Object = {}): Object {
    assert.isFalse("attrs" in data, `Compiler Issue: Custom elements should not have property "attrs" in data.`);
    const { key, dataset, slotset, props: _props, on: _on, class: _class } = data;
    assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
    const vnode = h(sel, { hook, key, slotset, dataset, on: {}, props: {}, _props, _on, _class }, []);
    vnode.Ctor = Ctor;
    return vnode;
}

// [h]tml node
export { h };

// [i]terable node
export function i(items: Array<any>, factory: Function): Array<VNode> {
    const len = Array.isArray(items) ? items.length : 0;
    const list = new Array(len);
    for (let i = 0; i < len; i += 1) {
        const vnode = factory(items[i], i);
        list[i] = vnode;
        assert.block(() => {
            const vnodes = Array.isArray(vnode) ? vnode : [vnode];
            vnodes.forEach((vnode: VNode | any) => {
                if (vnode && typeof vnode === 'object' && vnode.sel && vnode.Ctor && !vnode.key) {
                    console.warn(`Invalid key attribute for element <${vnode.sel}> in iteration of ${items} for index ${i} of ${len}. Solution: You can set a "key" attribute to a unique value so the diffing algo can guarantee to preserve the internal state of the instance of ${vnode.Ctor.name}.`);
                }
            });
        });
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
        flattened.forEach((vnodeOrString: string | VNode) => {
            if (typeof vnodeOrString === 'string') {
                return;
            }
            assert.vnode(vnodeOrString, 'Invalid children element, it should be a string or a vnode.');
        });
    });
    return flattened;
}
