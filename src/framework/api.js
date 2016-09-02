// @flow

import { factory as ComponentFactory } from "./vnode-component.js";
import { factory as HTMLFactory } from "./vnode-html.js";
import Text from "./vnode-text.js";
import Facet from "./vnode-facet.js";

import {
    EmptyObject,
    EmptyArray,
} from "./utils.js";

// [h]tml node
export function h(tagName: string, attrs: Object = EmptyObject, children: array<any> = EmptyArray): Object {
    const Ctor = HTMLFactory(tagName);
    return {
        Ctor,
        attrs,
        children,
        vnode: undefined,
        key: undefined,
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
        key: undefined,
    };
}

// [i]terable node
export function i(items: array<any> = EmptyArray, factory: Function): Array {
    const len = items.length;
    const list = new Array(len);
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        const element = factory(item);
        if (element.Ctor) {
            // storing metadata about the iterator in element to facilitate diffing
            element.key = item;
        }
        list[i] = element;
    }
    return list;
}

// empty [f]acet node
export function f(): Object {
    return {
        Ctor: Facet,
        attrs: EmptyObject,
        children: EmptyArray,
        vnode: undefined,
        key: undefined,
    };
}

// [t]ext node
export function t(value: string): Object {
    return {
        Ctor: Text,
        attrs: {
            textContent: value.toString(),
        },
        children: EmptyArray,
        vnode: undefined,
        key: undefined,
    };
}

// [m]emoized node
export function m() {
    throw new Error('TBI');
}
