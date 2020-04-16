/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Cached reference to globalThis
let _globalThis: any;

if (typeof globalThis === 'object') {
    _globalThis = globalThis;
}

export function getGlobalThis() {
    if (typeof _globalThis === 'object') {
        return _globalThis;
    }

    try {
        // eslint-disable-next-line no-extend-native
        Object.defineProperty(Object.prototype, '__magic__', {
            get: function () {
                return this;
            },
            configurable: true,
        });

        // @ts-ignore
        // __magic__ is undefined in Safari 10 and IE10 and older.
        // eslint-disable-next-line no-undef
        _globalThis = __magic__;

        // @ts-ignore
        delete Object.prototype.__magic__;
    } catch (ex) {
        // In IE8, Object.defineProperty only works on DOM objects.
    } finally {
        // If the magic above fails for some reason we assume that we are in a
        // legacy browser. Assume `window` exists in this case.
        if (typeof _globalThis === 'undefined') {
            _globalThis = window;
        }
    }

    return _globalThis;
}
