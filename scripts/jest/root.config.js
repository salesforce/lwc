/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    testTimeout: 60000, // Default timeout for all tests in ms. Jest's default is 5000ms
    rootDir: '../..',
    projects: ['<rootDir>/packages/@lwc/*'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 90,
            lines: 90,
        },
    },
};
