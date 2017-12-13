/* eslint-env node */

module.exports = {
    moduleFileExtensions: ['js', 'html'],
    "moduleNameMapper": {
        "^engine$": require.resolve('lwc-engine').replace('commonjs', 'modules'),
        "^wire-service$": "<rootDir>/src/main.js",
        "^x-(.+)$": "<rootDir>/src/modules/x/$1/$1",
        ".css$": "<rootDir>/global-jest-stub.js",
    },
    "transform": {
        "^.+\\.(js|html)$": "lwc-jest-transformer"
    },
    mapCoverage: true,
    collectCoverageFrom: ['src/*.js', '!**/__tests__/**'],
    coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
    coverageThreshold: {
        global: {
            branches: 78,
            functions: 93,
            lines: 95,
            statements: 95
        }
    }
};
