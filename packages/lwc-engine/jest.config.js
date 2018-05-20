const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: 'lwc-engine',
    setupTestFrameworkScriptFile: '<rootDir>/scripts/jest/setup.ts',
};
