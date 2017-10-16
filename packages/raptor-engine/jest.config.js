/* eslint-env node */

module.exports = {
    moduleFileExtensions: ['ts', 'js'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',

    transform: {
        '^.+\\.ts$': require.resolve('ts-jest/preprocessor.js'),
    },

    mapCoverage: true,
    collectCoverageFrom: ['src/framework/*.ts'],
    coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 87,
            lines: 87,
            statements: 87,
        },
    },
};
