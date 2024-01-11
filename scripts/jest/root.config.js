/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    testTimeout: 60000, // Default timeout for all tests in ms. Jest's default is 5000ms
    rootDir: '../..',
    projects: [
        '<rootDir>/packages/@lwc/babel-plugin-component',
        '<rootDir>/packages/@lwc/compiler',
        '<rootDir>/packages/@lwc/engine-core',
        '<rootDir>/packages/@lwc/engine-dom',
        '<rootDir>/packages/@lwc/engine-server',
        '<rootDir>/packages/@lwc/errors',
        '<rootDir>/packages/@lwc/features',
        '<rootDir>/packages/@lwc/module-resolver',
        '<rootDir>/packages/@lwc/rollup-plugin',
        '<rootDir>/packages/@lwc/shared',
        '<rootDir>/packages/@lwc/style-compiler',
        '<rootDir>/packages/@lwc/synthetic-shadow',
        '<rootDir>/packages/@lwc/template-compiler',
        '<rootDir>/packages/@lwc/wire-service',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 90,
            lines: 90,
        },
    },
    // Jest's default reporters are [clover, json, lcov, text]. We add the second text reporter to
    // use the output as the step summary when running tests in GitHub Actions. (Ideally, we'd use
    // a markdown reporter, but there don't seem to be any...)
    coverageReporters: ['clover', 'json', 'lcov', 'text', ['text', { file: 'coverage.txt' }]],
};
