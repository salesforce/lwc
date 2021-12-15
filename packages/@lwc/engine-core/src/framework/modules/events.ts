/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { VBaseElement } from '../../3rdparty/snabbdom/types';

export function applyEventListeners(vnode: VBaseElement) {
    const {
        elm,
        data: { on },
        owner: { renderer },
    } = vnode;

    if (isUndefined(on)) {
        return;
    }

    for (const name in on) {
        const handler = on[name];
        renderer.addEventListener(elm, name, (event: Event) => {
            handler(event);
        });
    }
}
