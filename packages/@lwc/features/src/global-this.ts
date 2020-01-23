/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export function getGlobalThis() {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Object.prototype, '__magic__', {
        get: function() {
            return this;
        },
        configurable: true,
    });
    // @ts-ignore
    // eslint-disable-next-line no-undef
    const g = __magic__;
    // @ts-ignore
    delete Object.prototype.__magic__;
    return g;
}
