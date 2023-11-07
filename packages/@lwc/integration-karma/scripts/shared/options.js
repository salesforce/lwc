/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

// Helpful error. Remove after a few months.
if (process.env.NATIVE_SHADOW) {
    throw new Error('NATIVE_SHADOW is deprecated. Use DISABLE_SYNTHETIC instead!');
}

const LEGACY_BROWSERS = Boolean(process.env.LEGACY_BROWSERS);
const DISABLE_SYNTHETIC = Boolean(process.env.DISABLE_SYNTHETIC);
const FORCE_NATIVE_SHADOW_MODE_FOR_TEST = Boolean(process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST);
const ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE = Boolean(
    process.env.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
);
const ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL = Boolean(
    process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL
);
const DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER = Boolean(
    process.env.DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER
);
const DISABLE_STATIC_CONTENT_OPTIMIZATION = Boolean(
    process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION
);
const NODE_ENV_FOR_TEST = process.env.NODE_ENV_FOR_TEST;
const LATEST_API_VERSION = 60;
const API_VERSION = process.env.API_VERSION
    ? parseInt(process.env.API_VERSION, 10)
    : LATEST_API_VERSION;

module.exports = {
    // Test configuration
    LEGACY_BROWSERS,
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
    NODE_ENV_FOR_TEST,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
    SYNTHETIC_SHADOW_ENABLED: !DISABLE_SYNTHETIC,
    LATEST_API_VERSION,
    API_VERSION,
    GREP: process.env.GREP,
    COVERAGE: Boolean(process.env.COVERAGE),

    // Sauce labs
    SAUCE_USERNAME: process.env.SAUCE_USERNAME,
    SAUCE_ACCESS_KEY: process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY,
    SAUCE_TUNNEL_ID: process.env.SAUCE_TUNNEL_ID,

    // CI
    IS_CI: Boolean(process.env.CI),
    CIRCLE_BUILD_NUM: process.env.CIRCLE_BUILD_NUM,
    CIRCLE_SHA1: process.env.CIRCLE_SHA1,
    CIRCLE_BRANCH: process.env.CIRCLE_BRANCH,
    CIRCLE_BUILD_URL: process.env.CIRCLE_BUILD_URL,
};
