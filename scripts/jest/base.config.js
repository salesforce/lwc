/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    preset: 'ts-jest',

    testEnvironment: 'jest-environment-jsdom-fifteen',

    globals: {
        'ts-jest': {
            // The tsconfig location has to be specified otherwise, it will not transform the javascript
            // files.
            tsConfig: '<rootDir>/tsconfig.json',

            // By default ts-jest reports typescript compilation errors. Let's disable for now diagnostic
            // reporting since some of the packages doesn't pass the typescript compilation.
            diagnostics: false,
        },
    },

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
