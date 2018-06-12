/* eslint-env node */

const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,
    moduleNameMapper: {
        '^assert$': '<rootDir>/dist/assertStub.js',
        '^aura$': '<rootDir>/dist/auraStub.js',
        '^aura-instrumentation$': '<rootDir>/dist/auraInstrumentationStub.js',
        '^instrumentation-service$': '<rootDir>/dist/auraInstrumentationStub.js',
        '^aura-storage$': '<rootDir>/dist/auraStorageStub.js',
        '^logger$': '<rootDir>/dist/loggerStub.js',
    },
    transform: {
        "^.+\\.(js|html|css)$": "lwc-jest-transformer",
    },
    resolver: "lwc-jest-resolver",
    testMatch: [ '**/__tests__/**/?(*.)(test).js' ],
    displayName: 'lwc-jest-preset',
};
