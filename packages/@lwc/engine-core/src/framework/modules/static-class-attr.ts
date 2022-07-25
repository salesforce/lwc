/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { RendererAPI } from '../renderer';
import { VBaseElement } from '../vnodes';

// The HTML class property becomes the vnode.data.classMap object when defined as a string in the template.
// The compiler takes care of transforming the inline classnames into an object. It's faster to set the
// different classnames properties individually instead of via a string.
export function applyStaticClassAttribute(vnode: VBaseElement, renderer: RendererAPI) {
    const {
        elm,
        data: { classMap },
    } = vnode;

    if (isUndefined(classMap)) {
        return;
    }

    const { getClassList } = renderer;
    const classList = getClassList(elm);
    for (const name in classMap) {
        classList.add(name);
    }
}
