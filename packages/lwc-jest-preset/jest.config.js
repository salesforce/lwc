const BASE_CONFIG = require('../../scripts/jest/base.config');
const PRESET_CONFIG = require('./jest-preset');

module.exports = {
    ...BASE_CONFIG,
    ...PRESET_CONFIG,

    displayName: 'lwc-jest-preset',

    // Disable coverage entirely for this package. This package overrides the jest configuration
    // to test it's internals. Because of this the coverage reports the fixtures code and not the
    // packages logic.
    coveragePathIgnorePatterns: [
        '<rootDir>/src',
    ],
};
