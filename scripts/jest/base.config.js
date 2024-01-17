/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    preset: 'ts-jest',
    testMatch: ['<rootDir>/**/__tests__/**/*.spec.(js|ts)'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/fixtures/',
        '/dist/',
        // Ignore helper files like test-utils.ts that might exist alongside spec files
        '/__tests__/',
    ],
};
