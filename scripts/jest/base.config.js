/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');

module.exports = {
    testMatch: ['<rootDir>/**/__tests__/*.spec.(js|ts)'],

    // Global mono-repo code coverage threshold.
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 85,
        },
    },

    moduleNameMapper: {
        '^@lwc/internal-jest-utils$': path.resolve(__dirname, './utils/index.js'),
    },
};
