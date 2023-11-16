/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

module.exports = {
    projectName: 'lwc',
    mainBranch: 'master',
    // This number is a tradeoff: higher = less variance, lower = less time spent running in CI
    benchmarkIterations: 60,
    // Refresh the browser between each iteration. This doesn't affect our benchmarks much
    // (since they already use for-loops, so we're only measuring peak performance, i.e. JITed performance),
    // but our tests assume that the DOM is fresh on each iteration
    benchmarkOnClient: false,
    // We only care about JS execution time, not style/layout/paint, or aggregate. We don't care about
    // the style/layout costs of the components that we're putting in the DOM; just how long LWC takes
    // to insert them into the DOM. Setting this to just 'script' also skips running an extra macro task:
    // https://github.com/salesforce/best/commit/6190687cce0559f1ed7678d70763c911a0f96610
    metrics: ['script'],
    plugins: [
        '@rollup/plugin-node-resolve',
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
    specs: { name: 'chrome.headless', version: 'latest' },
    apiDatabase: {
        adapter: 'rest/frontend',
        uri: process.env.BEST_FRONTEND_HOSTNAME,
        token: process.env.BEST_FRONTEND_CLIENT_TOKEN,
    },
    runners: [
        {
            alias: 'default',
            runner: '@best/runner-headless',
            config: {
                launchOptions: {
                    headless: 'new', // Use Chrome's new headless mode
                },
            },
        },
        {
            runner: '@best/runner-remote',
            alias: 'remote',
            config: {
                uri: process.env.BEST_HUB_HOSTNAME,
                options: {
                    authToken: process.env.BEST_HUB_CLIENT_TOKEN,
                },
                launchOptions: {
                    headless: 'new', // Use Chrome's new headless mode
                },
            },
        },
    ],
};
