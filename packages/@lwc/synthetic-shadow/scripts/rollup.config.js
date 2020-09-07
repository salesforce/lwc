/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const path = require('path');
const rollupConfig = require('../../../../scripts/rollup/rollup.config');

module.exports = rollupConfig({
    root: path.resolve(__dirname, '..'),
    name: 'synthetic-shadow',
    featureFlags: true,
});
