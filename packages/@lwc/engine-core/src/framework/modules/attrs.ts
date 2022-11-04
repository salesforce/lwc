/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isNull,
    isUndefined,
    StringCharCodeAt,
    XML_NAMESPACE,
    XLINK_NAMESPACE,
    hasOwnProperty,
    ArrayPush
} from '@lwc/shared';
import { RendererAPI } from '../renderer';

import { unlockAttribute, lockAttribute } from '../attributes';
import { EmptyObject } from '../utils';
import { VBaseElement } from '../vnodes';

const ColonCharCode = 58;

function diffAttr(elm: Element, key: string, setAttribute: (element: Element, name: string, value: string, namespace?: (string | null)) => void, cur: string | number | boolean, removeAttribute: (element: Element, name: string, namespace?: (string | null)) => void) {
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

export function patchAttributes(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI
) {
    const { owner } = vnode;
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
        const cur: any = attrs[key];
        const old = oldAttrs[key];

        // if (cur != null && 'subscribe' in cur) { // it may be a signal from the compiler
        //     // this is a store,
        //     const subscription = (cur as any).subscribe((v: any) => {
        //         diffAttr(elm!, key, setAttribute, v, removeAttribute);
        //     });
        //
        //     ArrayPush.call(owner.context.storeSubscriptions, subscription);
        //     continue;
        // }

        if (old !== cur) {
            diffAttr(elm!, key, setAttribute, cur, removeAttribute);
        }
    }
}
