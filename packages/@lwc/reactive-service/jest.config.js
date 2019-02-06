/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const BASE_CONFIG = require('../../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-reactive-service',

    roots: ['<rootDir>/src'],

    // Override global threshold for the package. As we increase the test coverage we should increase
    // the threshold as well.
    coverageThreshold: {
        global: {
            ...BASE_CONFIG.coverageThreshold.global,
            branches: 60,
        },
    },
};
