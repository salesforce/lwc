/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    // User jsdom 16 that adds support for custom elements https://github.com/jsdom/jsdom/releases/tag/16.2.0
    // jest v25 comes with jsdom v15
    testEnvironment: 'jest-environment-jsdom-sixteen',
    testMatch: ['<rootDir>/**/__tests__/*.spec.(js|ts)'],

    // Global mono-repo code coverage threshold.
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 85,
        },
    },
};
