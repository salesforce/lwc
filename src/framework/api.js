// @flow

import { factory as ComponentFactory } from "./vnode-component.js";
import { factory as HTMLFactory } from "./vnode-html.js";
import Text from "./vnode-text.js";
import Facet from "./vnode-facet.js";

import {
    EmptyObject,
    EmptyArray,
} from "./utils.js";

function elementFactory(Ctor: Class, attrs: Object, children: array<Object>): Object {
    return {
        Ctor,
        attrs,
        children,
        vnode: undefined,
        key: undefined,
        item: undefined,
    };
}

// [h]tml node
export function h(tagName: string, attrs: Object = EmptyObject, children: array<any> = EmptyArray): Object {
    const Ctor = HTMLFactory(tagName);
    return elementFactory(Ctor, attrs, children);
}

// [v]irtual node
export function v(ComponentCtor: Class, attrs: Object = EmptyObject, children: array<any> = EmptyArray): Object {
    const Ctor = ComponentFactory(ComponentCtor);
    return elementFactory(Ctor, attrs, children);
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
            element.item = item;
        }
        list[i] = element;
    }
    return list;
}

// empty [f]acet node
export function f(): Object {
    return elementFactory(Facet, EmptyObject, EmptyArray);
}

// [t]ext node
export function t(value: string): Object {
    const textContent = value === undefined ? '' : value + '';
    return elementFactory(Text, {
        textContent: textContent,
    }, EmptyArray);
}
