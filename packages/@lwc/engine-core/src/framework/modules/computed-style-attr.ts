/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isString } from '@lwc/shared';
import { VBaseElement } from '../../3rdparty/snabbdom/types';

// The style property is a string when defined via an expression in the template.
function updateStyleAttribute(oldVnode: VBaseElement, vnode: VBaseElement) {
    const {
        elm,
        data: { style: newStyle },
        owner: { renderer },
    } = vnode;
    const { setAttribute, removeAttribute } = renderer;
    if (oldVnode.data.style === newStyle) {
        return;
    }

    if (!isString(newStyle) || newStyle === '') {
        removeAttribute(elm, 'style');
    } else {
        setAttribute(elm, 'style', newStyle);
    }
}

const emptyVNode = { data: {} } as VBaseElement;

export default {
    create: (vnode: VBaseElement) => updateStyleAttribute(emptyVNode, vnode),
    update: updateStyleAttribute,
};
