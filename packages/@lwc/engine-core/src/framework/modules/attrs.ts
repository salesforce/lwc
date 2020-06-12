/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isNull, isUndefined, keys, StringCharCodeAt } from '@lwc/shared';
import { unlockAttribute, lockAttribute } from '../attributes';
import { EmptyObject } from '../utils';
import { VElement } from '../../3rdparty/snabbdom/types';

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;

function updateAttrs(oldVnode: VElement, vnode: VElement) {
    const {
        data: { attrs },
        owner: { renderer },
    } = vnode;

    if (isUndefined(attrs)) {
        return;
    }
    let {
        data: { attrs: oldAttrs },
    } = oldVnode;
    if (oldAttrs === attrs) {
        return;
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isUndefined(oldAttrs) || keys(oldAttrs).join(',') === keys(attrs).join(','),
            `vnode.data.attrs cannot change shape.`
        );
    }

    const elm = vnode.elm!;
    const { setAttribute, removeAttribute } = renderer;

    let key: string;
    oldAttrs = isUndefined(oldAttrs) ? EmptyObject : oldAttrs;

    // update modified attributes, add new attributes
    // this routine is only useful for data-* attributes in all kind of elements
    // and aria-* in standard elements (custom elements will use props for these)
    for (key in attrs) {
        const cur = attrs[key];
        const old = (oldAttrs as any)[key];
        if (old !== cur) {
            unlockAttribute(elm, key);
            if (StringCharCodeAt.call(key, 3) === ColonCharCode) {
                // Assume xml namespace
                setAttribute(elm, key, cur as string, xmlNS);
            } else if (StringCharCodeAt.call(key, 5) === ColonCharCode) {
                // Assume xlink namespace
                setAttribute(elm, key, cur as string, xlinkNS);
            } else if (isNull(cur)) {
                removeAttribute(elm, key);
            } else {
                setAttribute(elm, key, cur as string);
            }
            lockAttribute(elm, key);
        }
    }
}

const emptyVNode = { data: {} } as VElement;

export default {
    create: (vnode: VElement) => updateAttrs(emptyVNode, vnode),
    update: updateAttrs,
};
