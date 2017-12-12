/* eslint-env node */

module.exports = {
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '.ts': require.resolve('ts-jest/preprocessor.js')
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$$',
    mapCoverage: true,
};
