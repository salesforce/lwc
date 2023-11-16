/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assign, create, defineProperties } from '@lwc/shared';

// Note that ClipboardEvent is undefined in Jest/jsdom
// See: https://github.com/jsdom/jsdom/issues/1568
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
