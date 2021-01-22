/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isString } from '@lwc/shared';
import { VNode } from '../../3rdparty/snabbdom/types';

// The style property is a string when defined via an expression in the template.
function updateStyleAttribute(oldVnode: VNode, vnode: VNode) {
    const {
        elm,
        data: { style: newStyle },
        owner: { renderer },
    } = vnode;
    const { setCSSStyleProperty, removeAttribute } = renderer;
    if (oldVnode.data.style === newStyle) {
        return;
    }

    removeAttribute(elm, 'style');

    if (isString(newStyle) && newStyle !== '') {
        newStyle.split(';').forEach((style) => {
            if (style.trim().length) {
                const [name, value] = style.split(':');
                setCSSStyleProperty(elm, name.trim(), value.trim());
            }
        });
    }
}

const emptyVNode = { data: {} } as VNode;

export default {
    create: (vnode: VNode) => updateStyleAttribute(emptyVNode, vnode),
    update: updateStyleAttribute,
};
