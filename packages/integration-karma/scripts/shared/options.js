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
const TAGS = [
    `${DISABLE_SYNTHETIC ? 'native' : 'synthetic'}-shadow`,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST && 'forced-shadow-mode',
    COMPAT && 'compat',
].filter(Boolean);

module.exports = {
    // Test configuration
    COMPAT,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
    SYNTHETIC_SHADOW_ENABLED: !DISABLE_SYNTHETIC,
    TAGS,
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
