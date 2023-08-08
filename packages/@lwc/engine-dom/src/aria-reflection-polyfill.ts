/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { applyAriaReflection } from '@lwc/aria-reflection';

if (lwcRuntimeFlags.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL) {
    // If ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL is true, then we need to apply the ARIA reflection polyfill globally,
    // i.e. to the global Element.prototype
    applyAriaReflection();
}
