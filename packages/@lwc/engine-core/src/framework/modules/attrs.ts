/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined, StringCharCodeAt, XML_NAMESPACE, XLINK_NAMESPACE } from '@lwc/shared';

import { unlockAttribute, lockAttribute } from '../attributes';
import { EmptyObject } from '../utils';
import { VBaseElement } from '../vnodes';

const ColonCharCode = 58;

export function patchAttributes(oldVnode: VBaseElement | null, vnode: VBaseElement) {
    const { attrs } = vnode.data;
    if (isUndefined(attrs)) {
        return;
    }

    const oldAttrs = isNull(oldVnode) ? EmptyObject : oldVnode.data.attrs;
    if (oldAttrs === attrs) {
        return;
    }

    const {
        elm,
        owner: {
            renderer: { setAttribute, removeAttribute },
        },
    } = vnode;
    for (const key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];

        if (old !== cur) {
            unlockAttribute(elm!, key);
            if (StringCharCodeAt.call(key, 3) === ColonCharCode) {
                // Assume xml namespace
                setAttribute(elm, key, cur as string, XML_NAMESPACE);
            } else if (StringCharCodeAt.call(key, 5) === ColonCharCode) {
                // Assume xlink namespace
                setAttribute(elm, key, cur as string, XLINK_NAMESPACE);
            } else if (isNull(cur) || isUndefined(cur)) {
                removeAttribute(elm, key);
            } else {
                setAttribute(elm, key, cur as string);
            }
            lockAttribute(elm!, key);
        }
    }
}
