const BASE_CONFIG = require('../../scripts/jest/base.config');
const PRESET_CONFIG = require('./jest-preset');

module.exports = {
    ...BASE_CONFIG,
    ...PRESET_CONFIG,

    displayName: 'lwc-jest-preset',
};
