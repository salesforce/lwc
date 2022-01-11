/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

import { addEventListener } from '../../renderer';
import { VElement } from '../../3rdparty/snabbdom/types';

export function applyEventListeners(vnode: VElement) {
    const {
        elm,
        data: { on },
    } = vnode;

    if (isUndefined(on)) {
        return;
    }

    for (const name in on) {
        const handler = on[name];
        addEventListener(elm, name, (event: Event) => {
            handler(event);
        });
    }
}
