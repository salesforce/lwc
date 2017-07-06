import {
    isString,
} from './../language';

const DashCharCode = 45;

function updateStyle(oldVnode: VNode, vnode: VNode) {
    let { data: { style: oldStyle } } = oldVnode;
    let { data: { style } } = vnode;

    if (!oldStyle && !style) {
        return;
    }
    if (oldStyle === style) {
        return;
    }
    oldStyle = oldStyle || {};
    style = style || {};

    let name: string;
    const { elm } = vnode;

    if (isString(style)) {
        elm.style.cssText = style;
    } else {
        if (isString(oldStyle)) {
            elm.style.cssText = '';
        } else {
            for (name in oldStyle) {
                if (!(name in style)) {
                    elm.style.removeProperty(name);
                }
            }
        }

        for (name in style) {
            const cur = style[name];
            if (cur !== oldStyle[name]) {
                if (name.charCodeAt(0) === DashCharCode && name.charCodeAt(1) === DashCharCode) {
                    // if the name is prefied with --, it will be considered a variable, and setProperty() is needed
                    elm.style.setProperty(name, cur);
                } else {
                    elm.style[name] = cur;
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
