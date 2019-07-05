/* eslint-disable no-useless-escape */
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');
const BASE_CONFIG = require('../../../scripts/jest/base.config');
const LWC_ROOT = path.dirname(require.resolve('@lwc/engine'));
const LWC_PATH = path.join(LWC_ROOT, 'dist/engine.js');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-engine',

    roots: ['<rootDir>/src'],

    // Customize setup for the engine tests.
    setupFilesAfterEnv: [path.resolve(__dirname, 'scripts/jest/setup-test.js')],
    moduleNameMapper: {
        'test-utils': path.resolve(__dirname, 'scripts/jest/test-utils.js'),
        '@lwc/engine': LWC_PATH,
    },

    // Ignore jest custom setup scripts from the code coverage.
    coveragePathIgnorePatterns: [
        '<rootDir>/scripts/',
        '<rootDir>/src/polyfills',
        '<rootDir>/src/framework/wc.ts',
    ],

    // Override global threshold for the package. As we increase the test coverage we should increase
    // the threshold as well.
    coverageThreshold: {
        global: {
            functions: 65,
            lines: 75,
            branches: 65,
        },
    },
};
