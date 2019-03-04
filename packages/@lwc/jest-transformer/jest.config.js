/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const BASE_CONFIG = require('../../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-jest-transformer',

    moduleNameMapper: {
        '^(example|other)/(.+)$': '<rootDir>/src/test/modules/$1/$2/$2',
    },
    transform: {
        '^.+\\.(js|html|css)$': '<rootDir>/src/index.js',
    },
    testMatch: ['**/__tests__/**/?(*.)(test).js'],
    resolver: '@lwc/jest-resolver',
    snapshotSerializers: ['@lwc/jest-serializer'],

    // Disable coverage entirely for this package. This package overrides the jest configuration
    // to test its internals. Because of this the coverage reports the fixtures code and not the
    // package's logic.
    coveragePathIgnorePatterns: ['<rootDir>/src'],
};
