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

    displayName: 'lwc-synthetic-shadow',

    roots: ['<rootDir>/src'],

    // Customize setup for the engine tests.
    setupFilesAfterEnv: [path.resolve(__dirname, 'scripts/jest/setup-test.js')],
    moduleNameMapper: {
        'test-utils': path.resolve(__dirname, 'scripts/jest/test-utils.js'),
    },

    // Override global threshold for the package. As we increase the test coverage we should increase
    // the threshold as well.
    coverageThreshold: {
        global: {
            ...BASE_CONFIG.coverageThreshold.global,
            branches: 60,
        },
    },
};
