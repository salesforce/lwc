/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const {
    COMPAT,
    SYNTHETIC_SHADOW_ENABLED,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
    ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY,
    DISABLE_ARIA_REFLECTION_POLYFILL,
    NODE_ENV_FOR_TEST,
} = require('../../shared/options');

// These are used to decide the directory that coverage is written to
const TAGS = [
    `${SYNTHETIC_SHADOW_ENABLED ? 'synthetic' : 'native'}-shadow`,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST && 'force-native-shadow-mode',
    COMPAT && 'compat',
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE && 'native-lifecycle',
    ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY && 'scoped-registry',
    DISABLE_ARIA_REFLECTION_POLYFILL && 'disable-aria-polyfill',
    `NODE_ENV-${NODE_ENV_FOR_TEST}`,
].filter(Boolean);

module.exports = TAGS;
