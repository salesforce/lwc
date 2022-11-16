/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    projectName: 'lwc',
    mainBranch: 'master',
    benchmarkIterations: 30,
    // Refresh the browser between each iteration. This doesn't affect our benchmarks much
    // (since they already use for-loops, so we're only measuring peak performance, i.e. JITed performance),
    // but our tests assume that the DOM is fresh on each iteration
    benchmarkOnClient: false,
    plugins: [
        // Best is currently using an older version of Rollup, so we use an older @rollup/plugin-node-resolve
        '@lwc/rollup-plugin-node-resolve-v13',
        [
            '@rollup/plugin-replace',
            {
                values: {
                    // Run perf tests in prod mode, same as in Tachometer
                    'process.env.NODE_ENV': '"production"',
                },
                preventAssignment: true,
            },
        ],
    ],
    // This version should be updated when the Best infra updates, once per release
    specs: { name: 'chrome.headless', version: 108 },
    apiDatabase: {
        adapter: 'rest/frontend',
        uri: process.env.BEST_FRONTEND_HOSTNAME,
        token: process.env.BEST_FRONTEND_CLIENT_TOKEN,
    },
    runners: [
        {
            alias: 'default',
            runner: '@best/runner-headless',
        },
        {
            runner: '@best/runner-remote',
            alias: 'remote',
            config: {
                uri: process.env.BEST_HUB_HOSTNAME,
                options: {
                    authToken: process.env.BEST_HUB_CLIENT_TOKEN,
                },
            },
        },
    ],
};
