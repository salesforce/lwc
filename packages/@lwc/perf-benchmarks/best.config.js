module.exports = {
    projectName: 'lwc',
    mainBranch: 'master',
    benchmarkIterations: 30,
    // Refresh the browser between each iteration. This doesn't affect our benchmarks much
    // (since they already use for-loops, so we're only measuring peak performance, i.e. JITed performance),
    // but our tests assume that the DOM is fresh on each iteration
    benchmarkOnClient: false,
    // Best is currently using an older version of Rollup, so we use an older @rollup/plugin-node-resolve
    plugins: ['@lwc/rollup-plugin-node-resolve-v13'],
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
