/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined, StringCharCodeAt } from '@lwc/shared';

import { setAttribute, removeAttribute } from '../../renderer';
import { VElement } from '../../3rdparty/snabbdom/types';

import { unlockAttribute, lockAttribute } from '../attributes';
import { EmptyObject } from '../utils';

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const ColonCharCode = 58;

export function patchAttributes(oldVnode: VElement | null, vnode: VElement) {
    const { attrs } = vnode.data;
    if (isUndefined(attrs)) {
        return;
    }

    const oldAttrs = isNull(oldVnode) ? EmptyObject : oldVnode.data.attrs;
    if (oldAttrs === attrs) {
        return;
    }

    const { elm } = vnode;
    for (const key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];

        if (old !== cur) {
            unlockAttribute(elm!, key);
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
            lockAttribute(elm!, key);
        }
    }
}
