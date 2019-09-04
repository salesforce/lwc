/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isString } from '@lwc/shared';
import { VNode } from '../../3rdparty/snabbdom/types';
import { removeAttribute } from '../../env/element';

// The style property is a string when defined via an expression in the template.
function updateStyleAttribute(oldVnode: VNode, vnode: VNode) {
    const { style: newStyle } = vnode.data;
    if (oldVnode.data.style === newStyle) {
        return;
    }

    const elm = vnode.elm as HTMLElement;
    const { style } = elm;
    if (!isString(newStyle) || newStyle === '') {
        removeAttribute.call(elm, 'style');
    } else {
        style.cssText = newStyle;
    }
}

const emptyVNode = { data: {} };

export default {
    create: (vnode: VNode) => updateStyleAttribute(emptyVNode as VNode, vnode),
    update: updateStyleAttribute,
};
