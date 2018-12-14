const path = require('path');
const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-tslint-rules',

    roots: [
        '<rootDir>/src'
    ],

    moduleNameMapper: {
        'test-utils': path.resolve(__dirname, 'scripts/jest/test-utils.ts'),
    },

    coverageThreshold: {
        global: {
            ...BASE_CONFIG.coverageThreshold.global,
            branches: 50,
        },
    },
};
