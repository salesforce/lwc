/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from './shared/language';
import { FeatureFlag } from './flags';

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

const _globalThis = getGlobalThis();

// Initialize the configuration object if it isn't initialized already.
const LWC_config = _globalThis.LWC_config || {};

let runtimeFlags: { [name: string]: FeatureFlag };
if (process.env.NODE_ENV === 'production') {
    runtimeFlags = Object.assign({}, LWC_config.features);
} else {
    // For testing purposes, we want to share the same runtime flags across
    // bundles (e.g., engine, synthetic-shadow, etc).
    runtimeFlags = _globalThis.__lwcRuntimeFlags__;
    if (isUndefined(runtimeFlags)) {
        runtimeFlags = Object.assign({}, LWC_config.features);
        _globalThis.__lwcRuntimeFlags__ = runtimeFlags;
    }
}

function enableFeature(name: string) {
    if (process.env.NODE_ENV === 'production') {
        // this function should never leak to prod
        throw new ReferenceError();
    }
    runtimeFlags[name] = true;
}

function disableFeature(name: string) {
    if (process.env.NODE_ENV === 'production') {
        // this function should never leak to prod
        throw new ReferenceError();
    }
    runtimeFlags[name] = false;
}

export { enableFeature, disableFeature, runtimeFlags };
