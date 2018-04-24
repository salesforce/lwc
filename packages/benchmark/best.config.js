module.exports = {
    projectName: 'lwc-engine-benchmark',
    plugins: [
        ['rollup-plugin-lwc-compiler', {
            rootDir: '<rootDir>/src/',
            mode: 'prod',
        }],
    ],
    benchmarkOnClient: false,
    runnerConfig: [
        {
            "runner": '@best/runner-headless',
            "name": "default",
        },
        {
            "runner": '@best/runner-remote',
            "name": "remote",
            "config": {
                "host": "http://best-agent-pool.lwcjs.org",
                "options": { path: '/best' },
                "remoteRunner": "@best/runner-headless"
            }
        }],
};
