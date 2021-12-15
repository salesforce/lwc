/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isString } from '@lwc/shared';
import { VBaseElement } from '../../3rdparty/snabbdom/types';

// The style property is a string when defined via an expression in the template.
export function patchStyleAttribute(oldVnode: VBaseElement | null, vnode: VBaseElement) {
    const {
        elm,
        data: { style: newStyle },
        owner: { renderer },
    } = vnode;

    const oldStyle = isNull(oldVnode) ? undefined : oldVnode.data.style;
    if (oldStyle === newStyle) {
        return;
    }

    const { setAttribute, removeAttribute } = renderer;

    if (!isString(newStyle) || newStyle === '') {
        removeAttribute(elm, 'style');
    } else {
        setAttribute(elm, 'style', newStyle);
    }
}
