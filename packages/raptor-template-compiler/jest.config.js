/* eslint-env node */

module.exports = {
    transform: {
        '.(ts|tsx)': '<rootDir>../../node_modules/ts-jest/preprocessor.js'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    mapCoverage: true,
};
