import assert from "../assert";
import {
    isString,
    isUndefined,
} from './../language';
import { EmptyObject } from '../utils';
import { VNode, Module } from "../../3rdparty/snabbdom/types";
import { removeAttribute } from './../dom';

const DashCharCode = 45;

function updateStyle(oldVnode: VNode, vnode: VNode) {
    const { data: { style: newStyle } } = vnode;
    if (isUndefined(newStyle)) {
        return;
    }
    let { data: { style: oldStyle } } = oldVnode;
    if (oldStyle === newStyle) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldStyle) || typeof newStyle === typeof oldStyle, `vnode.data.style cannot change types.`);
    }

    let name: string;
    const elm = (vnode.elm as HTMLElement);
    const { style } = elm;
    if (isUndefined(newStyle) || newStyle as any === '') {
        removeAttribute.call(elm, 'style');
    } else if (isString(newStyle)) {
        style.cssText = newStyle;
    } else {
        if (!isUndefined(oldStyle)) {
            for (name in oldStyle) {
                if (!(name in newStyle)) {
                    style.removeProperty(name);
                }
            }
        } else {
            oldStyle = EmptyObject;
        }

        for (name in newStyle) {
            const cur = newStyle[name];
            if (cur !== (oldStyle as any)[name]) {
                if (name.charCodeAt(0) === DashCharCode && name.charCodeAt(1) === DashCharCode) {
                    // if the name is prefied with --, it will be considered a variable, and setProperty() is needed
                    style.setProperty(name, cur);
                } else {
                    // @ts-ignore
                    style[name] = cur;
                }
            }
        }
    }
}

const styleModule: Module = {
    create: updateStyle,
    update: updateStyle,
};
export default styleModule;
