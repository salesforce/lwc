module.exports = {
    moduleFileExtensions: ['ts', 'js'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',

    transform: {
        '^.+\\.ts$': require.resolve('ts-jest/preprocessor.js'),
    },

    setupFiles: [
        '<rootDir>/scripts/jest-setup.js',
    ],

    mapCoverage: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
    coverageThreshold: {
        global: {
            branches: 68,
            functions: 89,
            lines: 86,
            statements: 86,
        },
    },
};
