const path = require('path');
const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-engine',

    // Customize setup for the engine tests.
    setupTestFrameworkScriptFile: path.resolve(__dirname, 'scripts/jest/setup-test.js'),
    moduleNameMapper: {
        'test-utils': path.resolve(__dirname, 'scripts/jest/test-utils.js'),
    },

    // Ignore jest custom setup scripts from the code coverage.
    coveragePathIgnorePatterns: [
        '<rootDir>/scripts/',
    ],

    // Override global threshold for the package. As we increase the test coverage we should increase
    // the threshold as well.
    coverageThreshold: {
        global: {
            ...BASE_CONFIG.coverageThreshold.global,
            branches: 70,
        },
    },
};
