/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isString } from '@lwc/shared';
import { setAttribute, removeAttribute } from '../../renderer';
import { VNode } from '../../3rdparty/snabbdom/types';

// The style property is a string when defined via an expression in the template.
function updateStyleAttribute(oldVnode: VNode, vnode: VNode) {
    const {
        elm,
        data: { style: newStyle },
    } = vnode;
    if (oldVnode.data.style === newStyle) {
        return;
    }

    if (!isString(newStyle) || newStyle === '') {
        removeAttribute(elm, 'style');
    } else {
        setAttribute(elm, 'style', newStyle);
    }
}

const emptyVNode = { data: {} } as VNode;

export default {
    create: (vnode: VNode) => updateStyleAttribute(emptyVNode, vnode),
    update: updateStyleAttribute,
};
