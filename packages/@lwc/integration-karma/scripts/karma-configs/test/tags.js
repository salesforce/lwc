/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const {
    LEGACY_BROWSERS,
    SYNTHETIC_SHADOW_ENABLED,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
    NODE_ENV_FOR_TEST,
    API_VERSION,
} = require('../../shared/options');

// These are used to decide the directory that coverage is written to
const TAGS = [
    `${SYNTHETIC_SHADOW_ENABLED ? 'synthetic' : 'native'}-shadow`,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST && 'force-native-shadow-mode',
    LEGACY_BROWSERS && 'legacy-browsers',
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE && 'native-lifecycle',
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL && 'aria-polyfill',
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER && 'disable-synthetic-in-compiler',
    `NODE_ENV-${NODE_ENV_FOR_TEST}`,
    API_VERSION && `api-version-${API_VERSION}`,
].filter(Boolean);

module.exports = TAGS;
