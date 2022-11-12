/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    htmlAttributeToProperty,
    isNull,
    isUndefined,
    StringCharCodeAt,
    XML_NAMESPACE,
    XLINK_NAMESPACE,
} from '@lwc/shared';

import { RendererAPI } from '../renderer';
import { EmptyObject } from '../utils';
import { VBaseElement } from '../vnodes';

const ColonCharCode = 58;

export function patchAttrUnlessProp(
    oldVnode: VBaseElement | null,
    vnode: VBaseElement,
    renderer: RendererAPI
) {
    const {
        data: { attrs },
        elm,
    } = vnode;

    if (isUndefined(attrs)) {
        return;
    }

    const { removeAttribute, setAttribute } = renderer;
    const oldAttrs = isNull(oldVnode) ? EmptyObject : oldVnode.data.attrs;

    for (const name in attrs) {
        const cur = attrs[name];
        const old = oldAttrs[name];

        const propName = htmlAttributeToProperty(name);
        if (propName in elm!) {
            (elm as any)[propName] = cur;
        } else if (old !== cur) {
            if (StringCharCodeAt.call(name, 3) === ColonCharCode) {
                // Assume xml namespace
                setAttribute(elm, name, cur as string, XML_NAMESPACE);
            } else if (StringCharCodeAt.call(name, 5) === ColonCharCode) {
                // Assume xlink namespace
                setAttribute(elm, name, cur as string, XLINK_NAMESPACE);
            } else if (isNull(cur) || isUndefined(cur)) {
                removeAttribute(elm, name);
            } else {
                setAttribute(elm, name, cur as string);
            }
        }
    }
}
