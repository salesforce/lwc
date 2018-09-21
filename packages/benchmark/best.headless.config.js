module.exports = {
    projectName: 'lwc-engine-benchmark',
    plugins: [
        ['rollup-plugin-lwc-compiler', { rootDir: '<rootDir>/src/' }],
        ['rollup-plugin-replace', { 'process.env.NODE_ENV': JSON.stringify('production') }]
    ],
    benchmarkOnClient: false,
    benchmarkIterations: 60,
    runnerConfig: [
        {
            "runner": '@best/runner-headless',
            "name": "default",
        },
        {
            "runner": '@best/runner-remote',
            "name": "remote",
            "config": {
                "host": "http://best-agent-chrome-70.lwcjs.org",
                "options": { path: '/best' },
                "remoteRunner": "@best/runner-headless"
            }
        }
    ],
};
