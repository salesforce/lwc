/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    plugins: [
        [
            '@lwc/rollup-plugin',
            {
                rootDir: '<rootDir>/src/',
                exclude: ['/engine.js$/', '/@best/runtime/'],
            },
        ],
        [
            '@rollup/plugin-replace',
            { 'process.env.NODE_ENV': JSON.stringify('production'), preventAssignment: true },
        ],
    ],

    benchmarkOnClient: false,
    benchmarkIterations: 60,

    specs: { name: 'chrome.headless', version: '80' },
    runners: [
        {
            alias: 'default',
            runner: '@best/runner-headless',
        },
        {
            alias: 'remote',
            runner: '@best/runner-remote',
            config: {
                uri: process.env.HUB_URI,
                options: {
                    authToken: process.env.HUB_AUTH_TOKEN,
                },
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        },
    ],
};
