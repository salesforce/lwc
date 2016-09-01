// @flow

import { factory as ComponentFactory } from "./vnode-component.js";
import { factory as HTMLFactory } from "./vnode-html.js";
import {
    duplex,
    EmptyObject,
    EmptyArray,
    EmptyNode,
} from "./utils.js";

// [h]tml node
export function h(tagName: string, attrs: Object = EmptyObject, children: array<any> = EmptyArray): Object {
    const Ctor = HTMLFactory(tagName);
    return {
        Ctor,
        attrs,
        children,
        vnode: undefined,
    };
}

// [v]irtual node
export function v(ComponentCtor: Class, attrs: Object = EmptyObject, children: array<any> = EmptyArray): Object {
    const Ctor = ComponentFactory(ComponentCtor);
    return {
        Ctor,
        attrs,
        children,
        vnode: undefined,
    };
}

// [i]terable node
export function i(items: array<any> = EmptyArray, factory: Function): Array {
    const len = items.length;
    const list = new Array(len);
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        list[i] = duplex(item, factory(item));
    }
    return list;
}

// empty [f]acet node
export function f(): Object {
    return EmptyNode;
}

// [t]ext node
export function t(value: string): Object {
    return value.toString();
}

// [m]emoized node
export function m() {
    throw new Error('TBI');
}
