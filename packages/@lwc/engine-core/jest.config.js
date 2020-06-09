/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const BASE_CONFIG = require('../../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-engine-core',

    roots: ['<rootDir>/src'],

    // Customize setup for the engine tests.
    setupFilesAfterEnv: [path.resolve(__dirname, 'scripts/jest/setup-test.js')],
};
