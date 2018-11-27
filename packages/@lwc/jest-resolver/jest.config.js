/* eslint-env node */

const BASE_CONFIG = require('../../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-jest-resolver',

    transform: {
        '^.+\\.(js|html|css)$': '@lwc/jest-transformer',
    },
    resolver: '<rootDir>/src/index.js',
    testMatch: [ '**/__tests__/**/?(*.)(test).js' ],

    // Disable coverage entirely for this package. This package overrides the jest configuration
    // to test its internals. Because of this the coverage reports the fixtures code and not the
    // package's logic.
    coveragePathIgnorePatterns: [
        '<rootDir>/src',
        '<rootDir>/resources',
    ],
};
