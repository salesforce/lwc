/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isString, isUndefined } from '@lwc/shared';
import { RendererAPI } from '../renderer';
import { VBaseElement, VStaticPartElement } from '../vnodes';
import { logError } from '../../shared/logger';
import { VM } from '../vm';

// The style property is a string when defined via an expression in the template.
export function patchStyleAttribute(
    oldVnode: VBaseElement | VStaticPartElement | null,
    vnode: VBaseElement | VStaticPartElement,
    renderer: RendererAPI,
    owner: VM
) {
    const {
        elm,
        data: { style: newStyle },
    } = vnode;

    if (process.env.NODE_ENV !== 'production') {
        if (!isNull(newStyle) && !isUndefined(newStyle) && !isString(newStyle)) {
            logError(
                `Invalid 'style' attribute passed to <${elm!.tagName.toLowerCase()}> is ignored. This attribute must be a string value.`,
                owner
            );
        }
    }

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
