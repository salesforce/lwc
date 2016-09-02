// @flow

import dismounter from "./dismounter.js";
import mounter from "./mounter.js";
import {
    assertElement,
    flattenElements,
} from "./utils.js";

function rehydrate(element: Object, newAttrs: Object, newChildren: array): Object {
    const { attrs, children, vnode } = element;
    let isDirty = false;
    if (vnode.hasBodyAttribute && children !== newChildren) {
        newChildren = flattenElements(newChildren);
        element.children = newChildren;
        vnode.set('body', newChildren);
        isDirty = true;
    }
    if (attrs !== newAttrs) {
        element.attrs = newAttrs;
        // infuse new attrs into element.vnode
        for (let [attrName, attrValue] of Object.entries(newAttrs)) {
            if (attrs[attrName] !== attrValue) {
                vnode.set(attrName, attrValue);
                isDirty = true;
            }
        }
    }
    if (isDirty) {
        vnode.toBeHydrated();
    }
    return element;
}

export default function patcher(oldElement: any, newElement: any): Object {
    assertElement(newElement);
    if (oldElement === newElement) {
        return oldElement;
    }
    const { Ctor, attrs, children } = newElement;
    if (oldElement && oldElement.Ctor === Ctor) {
        return rehydrate(oldElement, attrs, children);
    } else {
        if (oldElement) {
            dismounter(oldElement);
        }
        mounter(newElement);
        return newElement;
    }
}
