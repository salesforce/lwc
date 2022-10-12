/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

// Helpful error. Remove after a few months.
if (process.env.NATIVE_SHADOW) {
    throw new Error('NATIVE_SHADOW is deprecated. Use DISABLE_SYNTHETIC instead!');
}

const COMPAT = Boolean(process.env.COMPAT);
const DISABLE_SYNTHETIC = Boolean(process.env.DISABLE_SYNTHETIC);
const FORCE_NATIVE_SHADOW_MODE_FOR_TEST = Boolean(process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST);
const ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE = Boolean(
    process.env.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
);
const ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY = Boolean(
    process.env.ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY
);

module.exports = {
    // Test configuration
    COMPAT,
    ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE,
    ENABLE_SCOPED_CUSTOM_ELEMENT_REGISTRY,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    SYNTHETIC_SHADOW_ENABLED: !DISABLE_SYNTHETIC,
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
