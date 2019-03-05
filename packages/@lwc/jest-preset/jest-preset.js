/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    moduleFileExtensions: ['js', 'html'],
    moduleNameMapper: {
        '^assert$': require.resolve('./src/stubs/assert.js'),
        '^aura$': require.resolve('./src/stubs/aura.js'),
        '^aura-instrumentation$': require.resolve('./src/stubs/auraInstrumentation.js'),
        '^instrumentation-service$': require.resolve('./src/stubs/auraInstrumentation.js'),
        '^aura-storage$': require.resolve('./src/stubs/auraStorage.js'),
        '^logger$': require.resolve('./src/stubs/logger.js'),

        '^lwc-test-utils$': require.resolve('@lwc/test-utils'),
    },
    resolver: require.resolve('@lwc/jest-resolver'),
    transform: {
        '^.+\\.(js|html|css)$': require.resolve('@lwc/jest-transformer'),
    },
    setupFiles: [require.resolve('./src/setup')],
    snapshotSerializers: [require.resolve('@lwc/jest-serializer')],
    testMatch: ['**/__tests__/**/?(*.)(spec|test).js'],

    // temp workaround until this is released - https://github.com/facebook/jest/pull/6792
    testURL: 'http://localhost/',
    coveragePathIgnorePatterns: ['.css$', '.html$'],
};
