import assert from "../assert";
import { prepareForValidAttributeMutation } from '../restrictions';
import { isUndefined, keys, StringCharCodeAt, isNull } from '../../shared/language';
import { EmptyObject } from '../utils';
import { Module, VNode } from "../../3rdparty/snabbdom/types";

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;

function updateAttrs(oldVnode: VNode, vnode: VNode) {
    const { data: { attrs } } = vnode;
    if (isUndefined(attrs)) {
        return;
    }
    let { data: { attrs: oldAttrs } } = oldVnode;
    if (oldAttrs === attrs) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isUndefined(oldAttrs) || keys(oldAttrs).join(',') === keys(attrs).join(','), `vnode.data.attrs cannot change shape.`);
    }

    const elm = vnode.elm as Element;

    let key: string;
    oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs;

    // update modified attributes, add new attributes
    // this routine is only useful for data-* attributes in all kind of elements
    // and aria-* in standard elements (custom elements will use props for these)
    for (key in attrs) {
        const cur = attrs[key];
        const old = (oldAttrs as any)[key];
        if (old !== cur) {
            if (process.env.NODE_ENV !== 'production') {
                prepareForValidAttributeMutation(elm, key);
            }
            if (StringCharCodeAt.call(key, 3) === ColonCharCode) {
                // Assume xml namespace
                elm.setAttributeNS(xmlNS, key, cur as string);
            } else if (StringCharCodeAt.call(key, 5) === ColonCharCode) {
                // Assume xlink namespace
                elm.setAttributeNS(xlinkNS, key, cur as string);
            } else if (isNull(cur)) {
                elm.removeAttribute(key);
            } else {
                elm.setAttribute(key, cur as string);
            }
        }
    }
}

const attributesModule: Module = {
    create: updateAttrs,
    update: updateAttrs
};
export default attributesModule;
