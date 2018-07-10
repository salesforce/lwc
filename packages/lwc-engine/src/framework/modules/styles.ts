import assert from "../../shared/assert";
import {
    isString,
    isUndefined,
} from '../../shared/language';
import { EmptyObject } from '../utils';
import { VNode, Module, VNodeStyle } from "../../3rdparty/snabbdom/types";
import { removeAttribute } from '../dom-api';

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
        // The style property is a string when defined via an expression in the template.
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

        // The style property is an object when defined as a string in the template. The compiler
        // takes care of transforming the inline style into an object. It's faster to set the
        // different style properties individually instead of via a string.
        for (name in newStyle) {
            const cur = newStyle[name];
            if (cur !== (oldStyle as VNodeStyle)[name]) {
                style[name] = cur;
            }
        }
    }
}

const styleModule: Module = {
    create: updateStyle,
    update: updateStyle,
};
export default styleModule;
