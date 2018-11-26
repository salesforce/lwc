const BASE_CONFIG = require('../../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,
    displayName: 'lwc-template-compiler',

    coverageThreshold: {
        global: {
            branches: 90,
            functions: 95,
            lines: 95,
        },
    },
};
