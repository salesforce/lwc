/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const { HIGHEST_API_VERSION } = require('@lwc/shared');

// Helpful error. Remove after a few months.
if (process.env.NATIVE_SHADOW) {
    throw new Error('NATIVE_SHADOW is deprecated. Use DISABLE_SYNTHETIC instead!');
}

const LEGACY_BROWSERS = Boolean(process.env.LEGACY_BROWSERS);
const DISABLE_SYNTHETIC = Boolean(process.env.DISABLE_SYNTHETIC);
const FORCE_NATIVE_SHADOW_MODE_FOR_TEST = Boolean(process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST);
const ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL = Boolean(
    process.env.ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL
);
const DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER = Boolean(
    process.env.DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER
);
const DISABLE_STATIC_CONTENT_OPTIMIZATION = Boolean(
    process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION
);
const ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION = Boolean(
    process.env.ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION
);
const NODE_ENV_FOR_TEST = process.env.NODE_ENV_FOR_TEST;
const API_VERSION = process.env.API_VERSION
    ? parseInt(process.env.API_VERSION, 10)
    : HIGHEST_API_VERSION;

const baseOptions = {
    API_VERSION,
    DISABLE_STATIC_CONTENT_OPTIMIZATION,
    DISABLE_SYNTHETIC,
    DISABLE_SYNTHETIC_SHADOW_SUPPORT_IN_COMPILER,
    ENABLE_ARIA_REFLECTION_GLOBAL_POLYFILL,
    ENABLE_SYNTHETIC_SHADOW_IN_HYDRATION,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    LEGACY_BROWSERS,
    NODE_ENV_FOR_TEST,
};

/** Unique directory name that encodes the flags that the tests were executed with. */
const COVERAGE_DIR_FOR_OPTIONS =
    Object.entries(baseOptions)
        .filter(([, val]) => val)
        .map(([key, val]) => `${key}=${val}`)
        .join('/') || 'no-options';

module.exports = {
    // Test configuration
    ...baseOptions,
    GREP: process.env.GREP,
    COVERAGE: Boolean(process.env.COVERAGE),
    COVERAGE_DIR_FOR_OPTIONS,

    // Sauce labs
    SAUCE_USERNAME: process.env.SAUCE_USERNAME,
    SAUCE_ACCESS_KEY: process.env.SAUCE_ACCESS_KEY || process.env.SAUCE_KEY,
    SAUCE_TUNNEL_ID: process.env.SAUCE_TUNNEL_ID,

    // CI
    IS_CI: Boolean(process.env.CI),
    GITHUB_RUN_ID: process.env.GITHUB_RUN_ID,
};
