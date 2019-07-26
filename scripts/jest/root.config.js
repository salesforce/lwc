/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    rootDir: '../..',
    testMatch: ['<rootDir>/**/__tests__/*.spec.(js|ts)'],
    projects: [
        '<rootDir>/packages/@lwc/errors',
        '<rootDir>/packages/@lwc/babel-plugin-component',
        '<rootDir>/packages/@lwc/compiler',
        '<rootDir>/packages/@lwc/engine',
        '<rootDir>/packages/@lwc/module-resolver',
        '<rootDir>/packages/@lwc/node-reactions',
        '<rootDir>/packages/@lwc/template-compiler',
        '<rootDir>/packages/@lwc/style-compiler',
        '<rootDir>/packages/@lwc/wire-service',
        '<rootDir>/packages/@lwc/rollup-plugin',
        '<rootDir>/packages/@lwc/synthetic-shadow',
    ],
};
