import assert from "../assert";
import {
    isString,
    isUndefined,
} from '../language';
import { EmptyObject } from '../utils';
import { VNode, Module, VNodeStyle } from "../../3rdparty/snabbdom/types";
import { removeAttribute } from '../dom';

function updateStyle(oldVnode: VNode, vnode: VNode) {
    const { style: newStyle } = vnode.data;
    if (isUndefined(newStyle)) {
        return;
    }
    let { style: oldStyle } = oldVnode.data;
    if (oldStyle === newStyle) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldStyle) || typeof newStyle === typeof oldStyle, `vnode.data.style cannot change types.`);
    }

    let name: string;
    const elm = (vnode.elm as HTMLElement);
    const { style } = elm;
    if (isUndefined(newStyle) || newStyle === '') {
        removeAttribute.call(elm, 'style');
    } else if (isString(newStyle)) {
        style.cssText = newStyle;
    } else {
        if (!isUndefined(oldStyle)) {
            for (name in oldStyle as VNodeStyle) {
                if (!(name in newStyle)) {
                    style.removeProperty(name);
                }
            }
        } else {
            oldStyle = EmptyObject;
        }

        for (name in newStyle) {
            const cur = newStyle[name];
            if (cur !== (oldStyle as VNodeStyle)[name]) {
                style.setProperty(name, cur);
            }
        }
    }
}

const styleModule: Module = {
    create: updateStyle,
    update: updateStyle,
};
export default styleModule;
