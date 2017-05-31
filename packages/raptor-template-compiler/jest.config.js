/* eslint-env node */

module.exports = {
    transform: {
      '^.+\\.ts$': '<rootDir>/jest-preprocessor.js',
    },
    moduleFileExtensions: [
        'ts',
        'js'
    ],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{ts,js}'
    ]
}
