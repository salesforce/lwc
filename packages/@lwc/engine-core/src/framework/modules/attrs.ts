/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined, StringCharCodeAt, XML_NAMESPACE, XLINK_NAMESPACE } from '@lwc/shared';
import { RendererAPI } from '../renderer';

import { EmptyObject } from '../utils';
import { VBaseElement } from '../vnodes';

const ColonCharCode = 58;

export function patchAttributes(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI
) {
    const { attrs } = vnode.data;
    if (isUndefined(attrs)) {
        return;
    }

    const oldAttrs = isNull(oldVnode) ? EmptyObject : oldVnode.data.attrs;
    if (oldAttrs === attrs) {
        return;
    }

    const { elm } = vnode;
    const { setAttribute, removeAttribute } = renderer;
    for (const key in attrs) {
        const cur = attrs[key];
        const old = oldAttrs[key];

        if (old !== cur) {
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
        }
    }
}
