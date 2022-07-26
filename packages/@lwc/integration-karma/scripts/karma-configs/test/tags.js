/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

'use strict';

const {
    SYNTHETIC_SHADOW_ENABLED,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST,
} = require('../../shared/options');

const TAGS = [
    `${SYNTHETIC_SHADOW_ENABLED ? 'synthetic' : 'native'}-shadow`,
    FORCE_NATIVE_SHADOW_MODE_FOR_TEST && 'force-native-shadow-mode',
].filter(Boolean);

module.exports = TAGS;
