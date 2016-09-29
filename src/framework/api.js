// @flow

import h from "snabbdom/h";
import * as hook from "./thunk.js";

// [h]tml node
export { h };

// [v]irtual node
export function v(Ctor: Class, data: Object = {}, body?: array<any>): Object {
    const { key, a: attributes } = data;
    return h(Ctor.name, {
        key,
        hook,
        Ctor,
        attributes,
        body,
    });
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
