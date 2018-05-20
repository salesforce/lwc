const path = require('path');

module.exports = {
    rootDir: '../..',
    projects: [
        '<rootDir>/packages/babel-plugin-transform-lwc-class',
        '<rootDir>/packages/lwc-compiler',
        '<rootDir>/packages/lwc-engine',
        '<rootDir>/packages/lwc-module-resolver',
        '<rootDir>/packages/lwc-template-compiler',
        '<rootDir>/packages/lwc-wire-service',
        '<rootDir>/packages/observable-membrane',
        '<rootDir>/packages/postcss-plugin-lwc',
        '<rootDir>/packages/rollup-plugin-lwc-compiler',
    ],
};
