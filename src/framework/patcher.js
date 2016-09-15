// @flow

import dismounter from "./dismounter.js";
import mounter from "./mounter.js";
import {
    assert,
    assertElement,
    flattenElements,
} from "./utils.js";

function rehydrate(oldElement: Object, newElement: Object): Object {
    const { attrs: oldAttrs, children: oldChildren, vnode } = oldElement;
    const { attrs: newAttrs, children: newChildren } = newElement;
    assert(vnode, 'rehydrate() method expects the first argument to be a fully funtional element.');
    let isDirty = false;
    newElement.vnode = vnode;
    if (vnode.hasBodyAttribute && oldChildren !== newChildren) {
        const children = flattenElements(newChildren);
        newElement.children = children;
        vnode.set('body', children);
        isDirty = true;
    }
    if (oldAttrs !== newAttrs) {
        const newKeys = Object.keys(newAttrs);
        const oldKeys = Object.keys(oldAttrs);
        const overlap = {};
        // infuse new attrs into element.vnode
        let newKeysLen = newKeys.length;
        for (let i = 0; i < newKeysLen; i += 1) {
            const attrName = newKeys[i];
            if (oldAttrs[attrName] !== newAttrs[attrName]) {
                vnode.set(attrName, newAttrs[attrName]);
                isDirty = true;
            }
            overlap[attrName] = true;
        }
        let oldKeysLen = oldKeys.length;
        for (let i = 0; i < oldKeysLen; i += 1) {
            const attrName = oldKeys[i];
            if (!overlap[attrName]) {
                vnode.set(attrName, undefined);
                isDirty = true;
            }
        }
    }
    if (isDirty) {
        vnode.toBeHydrated();
    }
    return newElement;
}

export default function patcher(oldElement: any, newElement: any): Object {
    assertElement(newElement);
    if (oldElement === newElement) {
        return oldElement;
    }
    const { Ctor } = newElement;
    if (oldElement && oldElement.Ctor === Ctor) {
        return rehydrate(oldElement, newElement);
    } else {
        if (oldElement) {
            dismounter(oldElement);
        }
        mounter(newElement);
        return newElement;
    }
}
