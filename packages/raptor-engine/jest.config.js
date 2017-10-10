/* eslint-env node */

module.exports = {
    mapCoverage: true,
    collectCoverageFrom: ['src/framework/*.ts'],
    coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 87,
            lines: 87,
            statements: 87
        }
    },
    projects: [
        "./scripts/jest/standard.config.js",
        "./scripts/jest/compat.config.js"
    ]
};
