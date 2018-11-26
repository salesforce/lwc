const BASE_CONFIG = require('../../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-wire-service',

    roots: [
        '<rootDir>/src'
    ],

    // Override global threshold for the package. As we increase the test coverage we should increase
    // the threshold as well.
    coverageThreshold: {
        global: {
            ...BASE_CONFIG.coverageThreshold.global,
            branches: 60,
        },
    },
};
