const path = require('path');
const BASE_CONFIG = require('../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,
    displayName: 'lwc-engine',

    setupTestFrameworkScriptFile: path.resolve(__dirname, 'scripts/jest/setup-test.js'),
};
