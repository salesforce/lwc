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
            // since we have split out this code from engine pkg
            // it is still tested from there and from integration tests
            // while only a small amount of units were copied into this pkg
            // TODO: #XXX - remove all units in favor of integration tests to avoid
            // the hazard of testing in jest/jsdom.
            branches: 15,
            functions: 5,
            lines: 30,
        },
    },
};
