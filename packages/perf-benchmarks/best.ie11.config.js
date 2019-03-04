/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
module.exports = {
    projectName: 'lwc-engine-benchmark-ie11',
    plugins: [
        ['@lwc/rollup-plugin', { rootDir: '<rootDir>/src/' }],
        ['rollup-plugin-replace', { 'process.env.NODE_ENV': JSON.stringify('production') }],
        ['rollup-plugin-compat', {}],
    ],
    benchmarkOnClient: false,
    benchmarkIterations: 60,
    testPathIgnorePatterns: ['**/__benchmarks__/benchmark-table-wc/*.benchmark.js'],
    runnerConfig: [
        {
            runner: '@best/runner-headless',
            name: 'default',
        },
        {
            runner: '@best/runner-remote',
            name: 'remote',
            config: {
                host: 'https://best-ie11-pool.lwcjs.org:5000',
                options: { path: '/best', rejectUnauthorized: false },
                remoteRunner: '@best/runner-webdriver',
                webdriverOptions: {
                    desiredCapabilities: {
                        platform: 'WINDOWS',
                        browserName: 'internet explorer',
                        version: '11',
                        ignoreZoomSetting: true,
                        initialBrowserUrl: 'about:blank',
                        nativeEvents: false,
                    },
                },
            },
        },
    ],
};
