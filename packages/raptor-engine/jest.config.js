/* eslint-env node */

module.exports = {
    mapCoverage: true,
    collectCoverageFrom: ['src/framework/*.ts'],
    coverageReporters: ['lcov', 'text', 'text-summary', 'html'],
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 85,
            lines: 85,
            statements: 85
        }
    },
    projects: [
        "./scripts/jest/standard.config.js",
        "./scripts/jest/compat.config.js"
    ]
};
