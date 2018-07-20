const path = require('path');
const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-engine',
    moduleNameMapper: {
        'test-utils': path.resolve(__dirname, 'scripts/jest/test-utils.js'),
    },
};
