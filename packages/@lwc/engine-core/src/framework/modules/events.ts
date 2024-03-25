/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { RendererAPI } from '../renderer';
import { VBaseElement, VStaticPartElement } from '../vnodes';

export function applyEventListeners(
    vnode: VBaseElement | VStaticPartElement,
    renderer: RendererAPI
) {
    const { elm, data } = vnode;
    const { on } = data;

    if (isUndefined(on)) {
        return;
    }

    const { addEventListener } = renderer;
    for (const name in on) {
        const handler = on[name];
        addEventListener(elm, name, handler);
    }
}
