/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import detect from './detect';
import apply from './polyfill';

if (detect()) {
    apply();
}

// TODO: Move this into @lwc/features/flags.ts
// Initialize the global configuration object if it isn't initialized already.
const _globalThis = globalThis as any;
_globalThis.LWC_config = _globalThis.LWC_config || {};
_globalThis.LWC_config.features = _globalThis.LWC_config.features || {};
