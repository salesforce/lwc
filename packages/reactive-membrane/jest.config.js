/* eslint-env node */

module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    testRegex: '/__tests__/',
    mapCoverage: true,
    collectCoverageFrom: ['src/*.ts'],
    coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
    coverageThreshold: {
        global: {
            branches: 55,
            functions: 50,
            lines: 70,
            statements: 75
        }
    },
    rootDir: './',
    transform: {
    '.(ts)': require.resolve('ts-jest/preprocessor.js')
    }
};
