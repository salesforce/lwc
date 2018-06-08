/* eslint-env node */

const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,
    moduleNameMapper: {
        '^(example|other)-(.+)$': '<rootDir>/src/test/modules/$1/$2/$2',
    },
    transform: {
        '^.+\\.(js|html|css)$': '<rootDir>/src/index.js',
    },
    testMatch: [ '**/__tests__/**/?(*.)(test).js' ],
    resolver: 'lwc-jest-resolver',
    displayName: 'lwc-jest-transformer',
    snapshotSerializers: ['lwc-jest-serializer'],
};
