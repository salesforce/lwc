/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');

const BASE_CONFIG = require('../../../scripts/jest/base.config');

const esModules = ['@parse5/tools'].join('|');

module.exports = {
    ...BASE_CONFIG,
    displayName: 'lwc-template-compiler',

    transform: {
        [`(${esModules}).+\\.js$`]: [
            'babel-jest',
            { configFile: path.join(__dirname, './babel.config.jest.json') },
        ],
    },

    transformIgnorePatterns: [`/node_modules/(?!${esModules})`],

    coverageThreshold: {
        global: {
            branches: 98,
            functions: 100,
            lines: 99,
        },
    },
};
