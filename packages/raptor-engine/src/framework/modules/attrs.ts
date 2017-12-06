import { prepareForAttributeMutationFromTemplate } from '../def';

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;
const XCharCode = 120;

function updateAttrs(oldVnode: VNode, vnode: VNode) {
    let { data: { attrs: oldAttrs } } = oldVnode;
    let { data: { attrs } } = vnode;

    if (!oldAttrs && !attrs) {
        return;
    }
    if (oldAttrs === attrs) {
        return;
    }
    const { elm } = vnode;
    const {
        setAttribute,
        removeAttribute
    } = elm;

    let key: string;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};

    // update modified attributes, add new attributes
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (process.env.NODE_ENV !== 'production') {
                prepareForAttributeMutationFromTemplate(elm, key);
            }

            if (cur === true) {
                setAttribute.call(elm, key, "");
            } else if (cur === false) {
                removeAttribute.call(elm, key);
            } else {
                if (key.charCodeAt(3) === ColonCharCode) {
                    // Assume xml namespace
                    elm.setAttributeNS.call(elm, xmlNS, key, cur);
                } else if (key.charCodeAt(5) === ColonCharCode) {
                    // Assume xlink namespace
                    elm.setAttributeNS.call(elm, xlinkNS, key, cur);
                } else {
                    setAttribute.call(elm, key, cur);
                }
            }
        }
    }
    // remove removed attributes
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            if (process.env.NODE_ENV !== 'production') {
                prepareForAttributeMutationFromTemplate(elm, key);
            }
            if (key.charCodeAt(3) === ColonCharCode) {
                // Assume xml namespace
                elm.removeAttributeNS.call(elm, xmlNS, key, cur);
            } else if (key.charCodeAt(5) === ColonCharCode) {
                // Assume xlink namespace
                elm.removeAttributeNS.call(elm, xlinkNS, key, cur);
            } else {
                removeAttribute.call(elm, key);
            }
        }
    }
}

const attributesModule: Module = {
    create: updateAttrs,
    update: updateAttrs
};
export default attributesModule;
