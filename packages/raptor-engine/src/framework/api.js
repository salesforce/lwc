import assert from "./assert.js";
import { lifeCycleHooks as hook } from "./hook.js";
import h from "snabbdom/h";
import { isArray, create, isUndefined, toString, push } from "./language.js";

const EmptyData = create(null);

// [c]ustom element node
export function c(sel: string, Ctor: Class<Component>, data: Object = EmptyData): Object {
    const { key, slotset, attrs, className, classMap, props: _props, on: _on } = data;
    assert.isTrue(arguments.length < 4, `Compiler Issue: Custom elements expect up to 3 arguments, received ${arguments.length} instead.`);
    const vnode = h(sel, { hook, key, slotset, attrs, className, classMap, _props, _on }, []);
    vnode.Ctor = Ctor;
    return vnode;
}

// [h]tml node
export { h };

// [i]terable node
export function i(items: Array<any>, factory: Function): Array<VNode> {
    const len = isArray(items) ? items.length : 0;
    const list = [];
    for (let i = 0; i < len; i += 1) {
        const vnode = factory(items[i], i);
        const isArrayNode = isArray(vnode);
        if (isArrayNode) {
            push.apply(list, vnode);
        } else {
            list.push(vnode);
        }

        assert.block(function devModeCheck() {
            const vnodes = isArrayNode ? vnode : [vnode];
            vnodes.forEach((vnode: VNode | any) => {
                if (vnode && typeof vnode === 'object' && vnode.sel && vnode.Ctor && isUndefined(vnode.key)) {
                    assert.logWarning(`Missing "key" attribute for element <${vnode.sel}> in iteration of ${toString(items)} for index ${i} of ${len}. Solution: You can set a "key" attribute to a unique value so the diffing algo can guarantee to preserve the internal state of the instance of "${toString(vnode.Ctor.name)}".`);
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
    assert.isTrue(isArray(items), 'flattening api can only work with arrays.')
    const len = items.length;
    const flattened = [];
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        if (isArray(item)) {
            flattened.push.apply(flattened, item);
        } else {
            flattened.push(item);
        }
    }
    assert.block(function devModeCheck() {
        flattened.forEach((vnodeOrString: string | VNode) => {
            if (typeof vnodeOrString === 'string') {
                return;
            }
            assert.vnode(vnodeOrString, 'Invalid children element, it should be a string or a vnode.');
        });
    });
    return flattened;
}
