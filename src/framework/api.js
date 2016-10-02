// @flow

import h from "snabbdom/h";
import * as hook from "./thunk.js";

// [h]tml node
export { h };

// [v]irtual node
// based on the structure from vue
// https://github.com/vuejs/babel-plugin-transform-vue-jsx
export function v(Ctor: Class, data: Object = {}, children?: array<any>): Object {
    data.hook = hook;
    const vnode = h(Ctor.name, data, children);
    vnode.Ctor = Ctor;
    return vnode;
}

// [i]terable node
export function i(items: array<any>, factory: Function): Array {
    const len = Array.isArray(items) ? items.length : 0;
    const list = new Array(len);
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        list[i] = factory(item);
    }
    return list;
}
