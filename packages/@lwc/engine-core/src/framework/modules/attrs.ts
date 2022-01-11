/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isNull, isUndefined, keys, StringCharCodeAt } from '@lwc/shared';

import { setAttribute, removeAttribute } from '../../renderer';
import { VElement } from '../../3rdparty/snabbdom/types';

import { unlockAttribute, lockAttribute } from '../attributes';
import { EmptyObject } from '../utils';

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;

export function patchAttributes(oldVnode: VElement | null, vnode: VElement) {
    const {
        data: { attrs },
    } = vnode;

    if (isUndefined(attrs)) {
        return;
    }

    let oldAttrs = isNull(oldVnode) ? undefined : oldVnode.data.attrs;

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
            } else if (isNull(cur) || isUndefined(cur)) {
                removeAttribute(elm, key);
            } else {
                setAttribute(elm, key, cur as string);
            }
            lockAttribute(elm, key);
        }
    }
}
