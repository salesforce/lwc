import {
    resetComponentProp,
    updateComponentProp,
} from "../component.js";
import assert from "../assert.js";

function update(oldVnode: VNode, vnode: VNode) {
    const { cache } = vnode;
    if (!cache) {
        return;
    }

    let { data: { props: oldProps, attrs: oldAttrs } } = oldVnode;
    let { data: { props, attrs }, cache: { def: { attrs: attrsConfig } } } = vnode;
    let key: string, cur: any, old: any;

    // allow attrs from compiler to be transfored as component's props when needed.
    if (oldAttrs !== attrs && (oldAttrs || attrs)) {
        oldAttrs = oldAttrs || {};
        attrs = attrs || {};
        for (key in attrs) {
            cur = attrs[key];
            old = oldAttrs[key];
            if (attrsConfig[key] && old !== cur) {
                if (cur) {
                    updateComponentProp(vnode, attrsConfig[key].propName, cur);
                } else {
                    resetComponentProp(vnode, attrsConfig[key].propName);
                }
                assert.isFalse(props && attrsConfig[key].propName in props, 'Compiler Error: An attribute and the reflective property cannot be both set in the same payload.');
            }
        }
    }

    if (oldProps !== props && (oldProps || props)) {
        oldProps = oldProps || {};
        props = props || {};
        // removed props should be resetted in component's props
        for (key in oldProps) {
            if (!(key in props)) {
                resetComponentProp(vnode, key);
            }
        }

        // new props should be setted in component's props
        for (key in props) {
            cur = props[key];
            old = oldProps[key];
            if (old !== cur) {
                updateComponentProp(vnode, key, cur);
            }
        }
    }

}

export default {
    create: update,
    update,
};
