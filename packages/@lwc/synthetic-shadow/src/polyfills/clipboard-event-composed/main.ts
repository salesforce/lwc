/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assign, create, defineProperties } from '@lwc/shared';

import { ClipboardEvent } from '../../env/global';

if (typeof ClipboardEvent !== 'undefined') {
    const isComposedType = assign(create(null), {
        copy: 1,
        cut: 1,
        paste: 1,
    });

    // Patch the prototype to override the composed property on user-agent dispatched events
    defineProperties(ClipboardEvent.prototype, {
        composed: {
            get() {
                const { type } = this;
                return isComposedType[type] === 1;
            },
            configurable: true,
            enumerable: true,
        },
    });
}
