/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const path = require('path');

const BASE_CONFIG = require('../../../scripts/jest/base.config');

const esModules = ['@parse5/tools', 'estree-walker'].join('|');

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
    // Avoids error: `Cannot find module 'estree-walker'`. This seems to be because estree-walker does not have
    // a `main` field in its `package.json` and instead only has the `module` and `exports` fields, so we have to
    // explicitly tell Jest where to find it.
    moduleNameMapper: {
        'estree-walker': '<rootDir>/node_modules/estree-walker/src/index.js',
    },
};
