/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {} from '@lwc/shared';
import type { RendererAPI } from '../renderer';
import type { VBaseElement } from '../vnodes';

// The HTML style property becomes the vnode.data.styleDecls object when defined as a string in the template.
// The compiler takes care of transforming the inline style into an object. It's faster to set the
// different style properties individually instead of via a string.
export function applyStaticStyleAttribute(vnode: VBaseElement, renderer: RendererAPI) {
    const {
        elm,
        data: { styleDecls },
    } = vnode;

    if (styleDecls === undefined) {
        return;
    }

    const { setCSSStyleProperty } = renderer;
    for (let i = 0; i < styleDecls.length; i++) {
        const [prop, value, important] = styleDecls[i];
        setCSSStyleProperty(elm, prop, value, important);
    }
}
