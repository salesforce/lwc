/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    projectName: 'lwc-engine-benchmark',
    plugins: [
        '<rootDir>/best-plugins/synthetic-shadow.js',
        [
            '@lwc/rollup-plugin',
            {
                rootDir: '<rootDir>/src/',
                exclude: ['/engine.js$/', '/@best/runtime/'],
            },
        ],
        ['rollup-plugin-replace', { 'process.env.NODE_ENV': JSON.stringify('production') }],
    ],
    benchmarkOnClient: false,
    benchmarkIterations: 60,
    runners: [
        {
            alias: 'default',
            runner: '@best/runner-headless',
        },
        {
            alias: 'remote',
            runner: '@best/runner-hub',
            config: {
                host: process.env.BEST_HUB_HOSTNAME,
                options: {
                    query: { token: process.env.BEST_HUB_CLIENT_TOKEN },
                },
                spec: {
                    browser: 'chrome',
                    version: '77',
                },
            },
        },
    ],
};
