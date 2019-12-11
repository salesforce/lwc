/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    // Use an up-to-date version of jsdom. Jest v24 comes with jsdom v11 which doesn't offer support
    // for native shadow DOM.
    testEnvironment: 'jest-environment-jsdom-fifteen',

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
