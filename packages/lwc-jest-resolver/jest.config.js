/* eslint-env node */

const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,
    transform: {
        "^.+\\.(js|html|css)$": "lwc-jest-transformer"
    },
    resolver: "<rootDir>/src/index.js",
    testMatch: [ '**/__tests__/**/?(*.)(test).js' ],
    displayName: 'lwc-jest-resolver',
};
