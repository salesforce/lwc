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
    let key: string;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};

    // update modified attributes, add new attributes
    for (key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];
        if (old !== cur) {
            if (cur === true) {
                elm.setAttribute(key, "");
            } else if (cur === false) {
                elm.removeAttribute(key);
            } else {
                if (key.charCodeAt(0) !== XCharCode) {
                    elm.setAttribute(key, cur);
                } else if (key.charCodeAt(3) === ColonCharCode) {
                    // Assume xml namespace
                    elm.setAttributeNS(xmlNS, key, cur);
                } else if (key.charCodeAt(5) === ColonCharCode) {
                    // Assume xlink namespace
                    elm.setAttributeNS(xlinkNS, key, cur);
                } else {
                    elm.setAttribute(key, cur);
                }
            }
        }
    }
    // remove removed attributes
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}

const attributesModule: Module = {
    create: updateAttrs,
    update: updateAttrs
};
export default attributesModule;
