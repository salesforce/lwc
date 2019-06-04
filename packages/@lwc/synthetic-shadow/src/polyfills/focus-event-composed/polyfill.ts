/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const originalComposedGetter = Object.getOwnPropertyDescriptor(Event.prototype, 'composed')!.get!;

Object.defineProperties(FocusEvent.prototype, {
    composed: {
        get(this: FocusEvent) {
            const { isTrusted } = this;
            const composed = originalComposedGetter.call(this);
            if (isTrusted && composed === false) {
                return true;
            }
            return composed;
        },
        enumerable: true,
        configurable: true,
    },
});
