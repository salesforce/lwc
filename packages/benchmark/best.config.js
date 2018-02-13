module.exports = {
    projectName: 'lwc-engine-benchmark',
    plugins: {
        'rollup-plugin-lwc-compiler': {
            rootDir: '<rootDir>/src/',
            mode: 'prod',
        },
    },
    benchmarkOnClient: false,
    benchmarkRunner: '@best/runner-headless',
};
