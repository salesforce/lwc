/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const COMPAT = Boolean(process.env.COMPAT);
const NATIVE_SHADOW = Boolean(process.env.NATIVE_SHADOW);
const TAGS = [`${NATIVE_SHADOW ? 'native' : 'synthetic'}-shadow`, COMPAT && 'compat'].filter((v) =>
    Boolean(v)
);

module.exports = {
    // Test configuration
    COMPAT,
    NATIVE_SHADOW,
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
