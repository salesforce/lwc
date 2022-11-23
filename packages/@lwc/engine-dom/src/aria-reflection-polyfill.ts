/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import features from '@lwc/features';
import { applyAriaReflection } from '@lwc/aria-reflection';

if (!features.DISABLE_ARIA_REFLECTION_POLYFILL) {
    applyAriaReflection();
}
