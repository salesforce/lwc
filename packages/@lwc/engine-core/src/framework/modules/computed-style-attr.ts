/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { logError } from '../../shared/logger';
import type { RendererAPI } from '../renderer';
import type { VBaseElement, VStaticPartElement } from '../vnodes';
import type { VM } from '../vm';

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
        if (newStyle !== null && newStyle !== undefined && typeof newStyle !== 'string') {
            logError(
                `Invalid 'style' attribute passed to <${elm!.tagName.toLowerCase()}> is ignored. This attribute must be a string value.`,
                owner
            );
        }
    }

    const oldStyle = oldVnode === null ? undefined : oldVnode.data.style;
    if (oldStyle === newStyle) {
        return;
    }

    const { setAttribute, removeAttribute } = renderer;
    if (typeof newStyle !== 'string' || newStyle === '') {
        removeAttribute(elm, 'style');
    } else {
        setAttribute(elm, 'style', newStyle);
    }
}
