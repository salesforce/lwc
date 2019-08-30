/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
function getGlobalThis() {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    // globalThis is not available in this env, so let's use some magic
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

// Initialize the global configuration object if it isn't initialized already.
const LWC_config = getGlobalThis().LWC_config || {};

export const runtimeFlags = Object.assign({}, LWC_config.features);

export function enableFeature(name: string) {
    runtimeFlags[name] = true;
}
export function disableFeature(name: string) {
    runtimeFlags[name] = false;
}
