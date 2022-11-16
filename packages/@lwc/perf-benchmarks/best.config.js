module.exports = {
    projectName: 'lwc',
    benchmarkOnClient: false,
    benchmarkIterations: 30,
    useMacroTaskAfterBenchmark: false,
    mainBranch: 'master',
    plugins: ['@lwc/rollup-plugin-node-resolve-v13'],
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
