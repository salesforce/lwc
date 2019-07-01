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
                exclude: [/\/engine.js$/, /@best\/runtime/],
            },
        ],
        ['rollup-plugin-replace', { 'process.env.NODE_ENV': JSON.stringify('production') }],
    ],
    benchmarkOnClient: false,
    benchmarkIterations: 60,
    runnerConfig: [
        {
            runner: '@best/runner-headless',
            name: 'default',
        },
        {
            runner: '@best/runner-remote',
            name: 'remote',
            config: {
                host: 'http://best-agent-chrome-70-heroku02.lwcjs.org',
                options: { path: '/best' },
                remoteRunner: '@best/runner-headless',
            },
        },
    ],
};
